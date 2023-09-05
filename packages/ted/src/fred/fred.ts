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
import type { TFredMessageRead } from './messages';
import { TFredMessageTypes } from './messages';

const TIME_PER_FRAME_TIME_UPDATE = 1000;

export interface TFredStats {
  renderTime: string;
}

/**
 * TFred runs on the main browser thread and handles rendering, input and the UI context
 */
export default class TFred {
  private canvas?: HTMLCanvasElement;

  public events!: TEventQueue;
  private keyboard!: TKeyboard;
  private mouse!: TMouse;
  private renderer!: TRenderer;
  private resources!: TResourceManager;
  private jobs!: TJobManager;
  private audio: TAudio = new TAudio();

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
    private updateEngineContext: (ctx: TEngineContextData) => void,
    private updateGameContext: (ctx: TGameContextData) => void
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
   * - Creating the canvas
   * - Starting to prepare graphics
   * - Setting up events, input, audio
   */
  private async bootstrap() {
    // Create the canvas
    this.container.classList.add('t-game-container');
    this.canvas = document.createElement('canvas');
    this.onResize();

    // @todo remove this listener when cleaning up
    window.addEventListener('resize', () => {
      this.onResize();
    });

    this.container.append(this.canvas);

    this.events = new TEventQueue([this.enginePort]);
    this.keyboard = new TKeyboard(this.events);
    this.mouse = new TMouse(this.events, this.canvas);

    this.jobs = new TJobManager([
      TJobContextTypes.Renderer,
      TJobContextTypes.Audio,
    ]);
    this.resources = new TResourceManager(this.jobs);

    this.renderer = new TRenderer(this.canvas, this.resources);
    await this.renderer.load();

    this.jobs.additionalContext = {
      resourceManager: this.resources,
      renderer: this.renderer,
      audio: this.audio,
    };

    this.jobs.addRelay([TJobContextTypes.Engine], this.enginePort);

    this.update();

    this.enginePort.onmessage = this.onEngineMessage.bind(this);

    const message: TFredMessageRead = {
      type: TFredMessageTypes.READY,
    };
    this.enginePort.postMessage(message);
  }

  private update() {
    const start = Date.now();
    this.events.update();

    if (this.latestFrame) {
      this.renderer.render(this.latestFrame);
    }

    window.requestAnimationFrame(this.update);

    const elapsed = start - this.lastFrameTimeUpdate;
    if (elapsed > TIME_PER_FRAME_TIME_UPDATE) {
      this.frameTime = Date.now() - start;
      this.lastFrameTimeUpdate = start;

      this.stats = {
        renderTime: this.frameTime.toFixed(1),
      };
    }
  }

  private onResize() {
    // @todo call this on window resize
    if (this.canvas) {
      // This is the size that WebGL will render at
      // On High DPI screens, this should be increased, e.g. * 2
      this.canvas.width = this.container.clientWidth;
      this.canvas.height = this.container.clientHeight;

      // This is the size that the canvas itself displays as in the browser
      this.canvas.style.width = `${this.container.clientWidth}px`;
      this.canvas.style.height = `${this.container.clientHeight}px`;
    }

    if (this.renderer) {
      this.renderer.onResize();
    }
  }
}

export interface TKeyupEvent {
  type: 'key_up';
  subType: string;
}
