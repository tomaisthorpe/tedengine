import TEventQueue from '../core/event-queue';
import type { TEvent } from '../core/event-queue';
import TGameStateManager from '../core/game-state-manager';
import { TMessageTypesCore } from '../core/messages';
import TProxyEventQueue from '../core/proxy-event-queue';
import TResourceManager from '../core/resource-manager';
import TDebugPanel from '../debug/debug-panel';
import type { TConfig } from '../engine/config';
import { TFredMessageTypes } from '../fred/messages';
import type { TMouseLocation, TMouseMoveEvent } from '../input/events';
import { TEventTypesInput } from '../input/events';
import { TJobContextTypes } from '../jobs/context-types';
import TJobManager from '../jobs/job-manager';
import type {
  TJobsMessageRelay,
  TJobsMessageRelayResult,
} from '../jobs/messages';
import { TMessageTypesJobs } from '../jobs/messages';
import type { TRenderingSizeChangedEvent } from '../renderer/events';
import { TEventTypesRenderer } from '../renderer/events';
import type { TFrameParams } from '../renderer/frame-params';
import type { TGameContextData, TEngineContextData } from '../ui/context';
import TSegmentTimer from '../debug/segment-timer';
import type {
  TEngineMessageBootstrap,
  TEngineMessageFrameReady,
  TEngineMessageUpdateEngineContext,
  TEngineMessageUpdateGameContext,
} from './messages';
import { TMessageTypesEngine } from './messages';
import { TInputManager } from '../input/input-manager';

const TIME_PER_ENGINE_TIME_UPDATE = 1000;

export type TPostMessageFunc =
  | ((message: unknown, transfer?: Transferable[]) => void)
  | ((message: unknown) => void);

export default class TEngine {
  /**
   * Event queue for the engine which will recieve all events.
   * Events are broadcast to the active game state queue and any workers.
   *
   * Add listeners to the game state queue to ensure they are only called when the game state is active.
   */
  public events: TEventQueue;

  public segmentTimer: TSegmentTimer;

  public resources: TResourceManager;
  public gameState: TGameStateManager = new TGameStateManager(this);
  public debugPanel: TDebugPanel;

  public renderingSize: { width: number; height: number } = {
    width: 1,
    height: 1,
  };

  public jobs: TJobManager;
  private frameNumber = 1;
  private then = -1;

  private processing = false;

  // todo: temporary
  public mouse?: TMouseLocation;
  public inputManager: TInputManager;

  // @todo move this somewhere more relevant
  public stats: {
    engineTime: number;
  } = {
    engineTime: 0,
  };
  private lastEngineTimeUpdate = 0;
  private fredPort!: MessagePort;

  constructor(
    private config: TConfig,
    private workerScope: DedicatedWorkerGlobalScope,
  ) {
    // Create channel for Fred
    const channel = new MessageChannel();
    this.fredPort = channel.port1;
    this.fredPort.onmessage = this.onMessage.bind(this);

    this.triggerBootstrap(workerScope.postMessage, channel);

    const proxyQueue = new TProxyEventQueue(
      () => this.gameState.current()?.events,
    );

    this.events = new TEventQueue([this.fredPort], [proxyQueue]);

    this.update = this.update.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.jobs = new TJobManager([TJobContextTypes.Engine]);
    this.jobs.setRelay(
      [TJobContextTypes.Renderer, TJobContextTypes.Audio],
      this.fredPort,
    );
    this.resources = new TResourceManager(this.jobs);

    this.jobs.additionalContext = {
      resourceManager: this.resources,
    };

    this.debugPanel = new TDebugPanel(this.events, config.debugPanelOpen, this);
    this.segmentTimer = new TSegmentTimer(this.debugPanel, 'Performance');

    this.inputManager = new TInputManager(this.events);
  }

  async onMessage(ev: MessageEvent) {
    // console.log('fred said: ', ev.data);
    const { data } = ev;
    switch (data.type) {
      case TFredMessageTypes.READY:
        this.load();
        break;
      case TMessageTypesCore.EVENT_RELAY:
        this.events.broadcast(data.event as TEvent, true);
        break;
      case TMessageTypesJobs.RELAY: {
        const relayMessage = data as TJobsMessageRelay;

        this.jobs.doRelayedJob(relayMessage.wrappedJob, this.fredPort);
        break;
      }
      case TMessageTypesJobs.RELAY_RESULT: {
        const relayResultMessage = data as TJobsMessageRelayResult;
        this.jobs.onRelayedResult(relayResultMessage.wrappedResult);
        break;
      }
      case TFredMessageTypes.SHUTDOWN:
        // Instruct current state to destroy, this includes the physics workers
        this.gameState.current()?.destroy();

        // Stop this worker
        this.workerScope.close();

        break;
    }
  }

  private async load() {
    // Register the provided game states into the manager
    for (const [name, state] of Object.entries(this.config.states)) {
      this.gameState.register(name, state);
    }

    this.start();
  }

  private async start() {
    // Setup mouse move listeners, this will be replaced in future
    this.events.addListener<TMouseMoveEvent>(
      TEventTypesInput.MouseMove,
      (e) => {
        this.mouse = e;
      },
    );

    this.events.addListener<TRenderingSizeChangedEvent>(
      TEventTypesRenderer.RenderingSizeChanged,
      (e) => {
        this.renderingSize = { width: e.width, height: e.height };
      },
    );

    await this.gameState.switch(this.config.defaultState);

    // Set this up to prevent issues on first frame, and to remove need for an if
    this.then = performance.now();

    setInterval(this.update, 1000 / 60);
  }

  private async update() {
    if (this.processing) return;
    this.processing = true;

    const now = performance.now();
    const delta = (now - this.then) / 1000.0;
    this.then = now;

    this.debugPanel.update(this, delta);

    const endEventUpdate = this.segmentTimer.startSegment('Event Update');
    this.events.update();
    endEventUpdate();

    this.inputManager.update(delta);

    const endGameStateUpdate =
      this.segmentTimer.startSegment('Game State Update');
    await this.gameState.update(delta);
    endGameStateUpdate();

    const endFramePreparation =
      this.segmentTimer.startSegment('Frame Preparation');
    const camera = this.gameState.getActiveCamera();

    if (!camera) {
      return;
    }

    const params: TFrameParams = {
      frameNumber: this.frameNumber,
      lighting: this.gameState.getLighting(),
      renderTasks: this.gameState.getRenderTasks(),
      cameraView: camera.getView(),
      projectionMatrix: camera?.getProjectionMatrix(
        this.renderingSize.width,
        this.renderingSize.height,
      ),
    };

    const message: TEngineMessageFrameReady = {
      type: TMessageTypesEngine.FRAME_READY,
      params,
    };

    this.fredPort.postMessage(message);
    endFramePreparation();

    this.frameNumber++;

    // Update stats
    // @todo update stats with segment timer data
    const elapsed = now - this.lastEngineTimeUpdate;
    if (elapsed > TIME_PER_ENGINE_TIME_UPDATE) {
      this.stats.engineTime = performance.now() - now;

      this.lastEngineTimeUpdate = now;
    }

    this.processing = false;
  }

  /**
   * Sends a message to inform the mnain thread that the engine worker is ready for it to start configuring itself.
   *
   * In future this will also provide some config to the bootstrapper.
   */
  private triggerBootstrap(
    postMessage: TPostMessageFunc,
    channel: MessageChannel,
  ) {
    const message: TEngineMessageBootstrap = {
      type: TMessageTypesEngine.BOOTSTRAP,
    };

    postMessage(message, [channel.port2]);
  }

  public updateGameContext(data: TGameContextData) {
    const message: TEngineMessageUpdateGameContext = {
      type: TMessageTypesEngine.UPDATE_GAME_CONTEXT,
      data,
    };

    this.fredPort.postMessage(message);
  }

  public updateEngineContext(data: TEngineContextData) {
    const message: TEngineMessageUpdateEngineContext = {
      type: TMessageTypesEngine.UPDATE_ENGINE_CONTEXT,
      data,
    };

    this.fredPort.postMessage(message);
  }
}
