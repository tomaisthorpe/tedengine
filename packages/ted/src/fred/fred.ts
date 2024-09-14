import TAudio from '../audio/audio';
import type { TEvent } from '../core/event-queue';
import TEventQueue from '../core/event-queue';
import { TMessageTypesCore } from '../core/messages';
import TResourceManager from '../core/resource-manager';
import type {
  TEngineMessageFrameReady,
  TEngineMessageUpdateEngineContext,
  TEngineMessageUpdateGameContext,
} from '../engine/messages';
import { TMessageTypesEngine } from '../engine/messages';
import TKeyboard from '../input/keyboard';
import TMouse from '../input/mouse';
import { TJobContextTypes } from '../jobs/context-types';
import TJobManager from '../jobs/job-manager';
import type {
  TJobsMessageRelay,
  TJobsMessageRelayResult,
} from '../jobs/messages';
import { TMessageTypesJobs } from '../jobs/messages';
import type { TFrameParams } from '../renderer/frame-params';
import TRenderer from '../renderer/renderer';
import type { TEngineContextData, TGameContextData } from '../ui/context';
import TBrowser from './browser';
import type { TWindowBlurEvent, TWindowFocusEvent } from './events';
import { TEventTypesWindow } from './events';
import type { TFredMessageReady, TFredMessageShutdown } from './messages';
import { TFredMessageTypes } from './messages';

const TIME_PER_FRAME_TIME_UPDATE = 1000;

export interface TFredStats {
  renderTime: string;
}

export interface TFredConfig {
  renderWidth?: number;
  renderHeight?: number;
  imageRendering: 'auto' | 'pixelated' | 'crisp-edges';
  showFullscreenToggle?: boolean;
  showAudioToggle?: boolean;
}

/**
 * TFred runs on the main browser thread and handles rendering, input and the UI context
 */
export default class TFred {
  public canvas?: HTMLCanvasElement;
  public events!: TEventQueue;
  private keyboard!: TKeyboard;
  private mouse!: TMouse;
  private renderer!: TRenderer;
  private resources!: TResourceManager;
  private jobs!: TJobManager;
  public audio: TAudio = new TAudio();

  // Holds the state of the latest frame.
  // This should be rendered when the render loops happens.
  private latestFrame?: TFrameParams;

  private frameTime = 0;
  private lastFrameTimeUpdate = 0;

  public stats: TFredStats = {
    renderTime: '0.0',
  };

  private enginePort!: MessagePort;

  constructor(
    engineWorker: Worker,
    private container: HTMLElement,
    private fullscreenContainer: HTMLElement,
    private updateEngineContext: (ctx: TEngineContextData) => void,
    private updateGameContext: (ctx: TGameContextData) => void,
    private setErrorMessage: (message: string) => void,
    private setScaling: (scaling: number) => void,
    private setRenderingSize: (size: { width: number; height: number }) => void,
    private config?: TFredConfig,
  ) {
    engineWorker.onmessage = this.onEngineMessage.bind(this);

    this.update = this.update.bind(this);
  }

  private onEngineMessage(ev: MessageEvent): void {
    // console.log('engine said: ', ev.data);

    const { data } = ev;
    switch (data.type) {
      case TMessageTypesEngine.BOOTSTRAP:
        this.enginePort = ev.ports[0];
        this.bootstrap();
        break;
      case TMessageTypesCore.EVENT_RELAY:
        this.events.broadcast(data.event as TEvent, true);
        break;
      case TMessageTypesEngine.FRAME_READY: {
        const message = data as TEngineMessageFrameReady;
        if (
          !this.latestFrame ||
          message.params.frameNumber > this.latestFrame.frameNumber
        ) {
          this.latestFrame = message.params;
        }
        break;
      }
      case TMessageTypesJobs.RELAY: {
        const relayMessage = data as TJobsMessageRelay;
        this.jobs.doRelayedJob(relayMessage.wrappedJob, this.enginePort);
        break;
      }
      case TMessageTypesJobs.RELAY_RESULT: {
        const relayResultMessage = data as TJobsMessageRelayResult;
        this.jobs.onRelayedResult(relayResultMessage.wrappedResult);
        break;
      }
      case TMessageTypesEngine.UPDATE_ENGINE_CONTEXT: {
        const updateEngineContextMessage =
          data as TEngineMessageUpdateEngineContext;
        this.updateEngineContext(updateEngineContextMessage.data);
        break;
      }
      case TMessageTypesEngine.UPDATE_GAME_CONTEXT: {
        const updateGameContextMessage =
          data as TEngineMessageUpdateGameContext;
        this.updateGameContext({
          ...updateGameContextMessage.data,
          frameTime: this.frameTime,
        });
        break;
      }
    }
  }

  /**
   * Bootstrap gets the main thread ready for loading by:
   * - Checking browser features
   * - Creating the canvas
   * - Starting to prepare graphics
   * - Setting up events, input, audio
   */
  private async bootstrap() {
    const browser = new TBrowser();
    if (!browser.supports('webgl2') || !browser.supports('offscreencanvas')) {
      // @todo show error message
      this.setErrorMessage(
        'Browser does not support WebGL2 or OffscreenCanvas',
      );
      return;
    }

    // Create the canvas
    this.container.classList.add('t-game-container');
    this.canvas = document.createElement('canvas');
    this.canvas.style.imageRendering = this.config?.imageRendering || 'auto';
    this.canvas.style.display = 'block';

    this.onResize(this.container.clientWidth, this.container.clientHeight);
    this.setupResizeObserver();

    this.canvas.addEventListener(
      'webglcontextlost',
      (e) => {
        this.setErrorMessage('Context Lost');
      },
      false,
    );

    this.onChangeFullscreen = this.onChangeFullscreen.bind(this);
    window.addEventListener('fullscreenchange', this.onChangeFullscreen);

    this.onBlur = this.onBlur.bind(this);
    window.addEventListener('blur', this.onBlur);

    this.onFocus = this.onFocus.bind(this);
    window.addEventListener('focus', this.onFocus);

    this.container.append(this.canvas);

    this.jobs = new TJobManager([
      TJobContextTypes.Renderer,
      TJobContextTypes.Audio,
    ]);
    this.resources = new TResourceManager(this.jobs);

    this.events = new TEventQueue([this.enginePort]);

    this.renderer = new TRenderer(this.canvas, this.resources, this.events);
    await this.renderer.load();

    this.keyboard = new TKeyboard(this.events);
    this.mouse = new TMouse(this.events, this.canvas);

    this.jobs.additionalContext = {
      resourceManager: this.resources,
      renderer: this.renderer,
      audio: this.audio,
    };

    this.jobs.setRelay([TJobContextTypes.Engine], this.enginePort);

    this.update();

    this.enginePort.onmessage = this.onEngineMessage.bind(this);

    const message: TFredMessageReady = {
      type: TFredMessageTypes.READY,
    };
    this.enginePort.postMessage(message);
  }

  public toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();

      // Reset the container size to force a resize event
      this.onResize(0, 0);
    } else {
      this.fullscreenContainer.requestFullscreen();
    }
  }

  private onChangeFullscreen(e: Event) {
    // Exited full screen
    if (!document.fullscreenElement) {
      this.onResize(0, 0);
    }
  }

  private update() {
    const start = performance.now();
    this.events.update();

    if (this.latestFrame) {
      this.renderer.render(this.latestFrame);
    }

    window.requestAnimationFrame(this.update);

    const elapsed = start - this.lastFrameTimeUpdate;
    if (elapsed > TIME_PER_FRAME_TIME_UPDATE) {
      this.frameTime = performance.now() - start;
      this.lastFrameTimeUpdate = start;

      this.stats = {
        renderTime: this.frameTime.toFixed(1),
      };
    }
  }

  private setupResizeObserver() {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      this.onResize(entry.contentRect.width, entry.contentRect.height);
    });

    observer.observe(this.container);
  }

  private onResize(containerWidth: number, containerHeight: number) {
    // @todo call this on window resize
    if (this.canvas) {
      // This is the size that WebGL will render at
      // @todo take into account device pixel ratio
      if (this.config && this.config.renderWidth && this.config.renderHeight) {
        this.canvas.width = this.config.renderWidth;
        this.canvas.height = this.config.renderHeight;
      } else if (containerWidth && containerHeight) {
        this.canvas.width = containerWidth;
        this.canvas.height = containerHeight;
      }

      // This is the size that the canvas itself displays as in the browser
      this.canvas.style.width = `${containerWidth}px`;
      this.canvas.style.height = `${containerHeight}px`;

      this.setScaling(containerWidth / this.canvas.width);
      this.setRenderingSize({
        width: this.canvas.width,
        height: this.canvas.height,
      });
    }

    if (this.renderer) {
      this.renderer.onResize();
    }
  }

  private onBlur() {
    const message: TWindowBlurEvent = {
      type: TEventTypesWindow.Blur,
    };
    this.events.broadcast(message);
  }

  private onFocus() {
    const message: TWindowFocusEvent = {
      type: TEventTypesWindow.Focus,
    };
    this.events.broadcast(message);
  }

  /**
   * Trigger cleanup across the whole engine
   */
  public destroy() {
    // @todo should this be an event? might be nicer when there's more threds
    if (this.enginePort) {
      const message: TFredMessageShutdown = {
        type: TFredMessageTypes.SHUTDOWN,
      };
      this.enginePort.postMessage(message);
    }

    window.removeEventListener('fullscreenchange', this.onChangeFullscreen);
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('focus', this.onFocus);

    // @todo do full teardown on this thread
    this.mouse?.destroy();
    this.keyboard?.destroy();
  }
}

export interface TKeyupEvent {
  type: 'key_up';
  subType: string;
}
