import type { TEngine } from '../engine/engine';
import { TJobContextTypes } from '../jobs/context-types';
import { TJobManager } from '../jobs/job-manager';
import type { TSerializedLighting } from '../renderer/frame-params';
import { TEventQueue } from './event-queue';
import { TEventTypesCore } from './events';
import { TWorld } from './world';
import type { TSegmentTimingContext } from '../debug/segment-timer';

export interface TGameStateWithOnUpdate extends TGameState {
  onUpdate(engine: TEngine, delta: number): Promise<void>;
}

const hasOnUpdate = (state: TGameState): state is TGameStateWithOnUpdate =>
  'onUpdate' in state && typeof state.onUpdate === 'function';

export interface TGameStateWithOnCreate extends TGameState {
  onCreate(engine: TEngine): Promise<void>;
}

const hasOnCreate = (state: TGameState): state is TGameStateWithOnCreate =>
  'onCreate' in state && typeof state.onCreate === 'function';

export interface TGameStateWithOnEnter extends TGameState {
  onEnter(engine: TEngine, ...args: unknown[]): Promise<void>;
}

const hasOnEnter = (state: TGameState): state is TGameStateWithOnEnter =>
  'onEnter' in state && typeof state.onEnter === 'function';

export interface TGameStateWithOnResume extends TGameState {
  onResume(engine: TEngine, ...args: unknown[]): Promise<void>;
}

const hasOnResume = (state: TGameState): state is TGameStateWithOnResume =>
  'onResume' in state && typeof state.onResume === 'function';

export interface TGameStateWithOnLeave extends TGameState {
  onLeave(engine: TEngine): Promise<void>;
}

const hasOnLeave = (state: TGameState): state is TGameStateWithOnLeave =>
  'onLeave' in state && typeof state.onLeave === 'function';

export interface TGameStateWithBeforeWorldCreate extends TGameState {
  beforeWorldCreate(engine: TEngine): Promise<void>;
}

const hasBeforeWorldCreate = (
  state: TGameState,
): state is TGameStateWithBeforeWorldCreate =>
  'beforeWorldCreate' in state && typeof state.beforeWorldCreate === 'function';

export class TGameState {
  public created = false;
  public world?: TWorld;

  /**
   * Event queue for the game state which will recieve all events when the state is active.
   */
  public events: TEventQueue = new TEventQueue();

  public jobs: TJobManager;

  constructor(protected engine: TEngine) {
    this.jobs = new TJobManager([TJobContextTypes.GameState]);
    this.jobs.additionalContext = {
      gameState: this,
    };

    this.jobs.setRelay(
      [
        TJobContextTypes.Engine,
        TJobContextTypes.Audio,
        TJobContextTypes.Renderer,
      ],
      () => engine.jobs,
    );
  }

  /**
   * Called every frame with delta
   *
   * @param engine
   * @param delta time since last frame
   *
   * **DO NOT OVERRIDE!** Add [[`onUpdate`]] instead.
   * @hidden
   */
  public async update(
    engine: TEngine,
    delta: number,
    timingSegment?: TSegmentTimingContext,
  ): Promise<void> {
    this.events.update();

    if (!this.world) return;

    await this.world.update(engine, delta, timingSegment);

    if (hasOnUpdate(this)) {
      await this.onUpdate(engine, delta);
    }
  }

  public getRenderTasks() {
    return this.world?.getRenderTasks() ?? [];
  }

  public getLighting(): TSerializedLighting {
    return this.world?.getLighting() ?? {};
  }

  /**
   * Called once before entering the state for the first time
   *
   * **DO NOT OVERRIDE!** Add [[`onCreate`]] instead.
   * @hidden
   */
  public async create(engine: TEngine) {
    this.world = new TWorld(engine, this);

    if (hasBeforeWorldCreate(this)) {
      await this.beforeWorldCreate(engine);
    }

    await this.world.create();

    if (hasOnCreate(this)) {
      await this.onCreate(engine);
    }

    this.events.broadcast({
      type: TEventTypesCore.GameStateCreated,
    });
  }

  /**
   * Called every time when entering the state
   *
   * **DO NOT OVERRIDE!** Add [[`onEnter`]] instead.
   * @hidden
   */
  public async enter(engine: TEngine, ...args: unknown[]) {
    this.world?.start();

    if (hasOnEnter(this)) {
      await this.onEnter(engine, ...args);
    }

    this.events.broadcast({
      type: TEventTypesCore.GameStateEntered,
    });
  }

  /**
   * Called when leaving a state, such as through [[`TGameStateManager.pop`]] or [[`TGameStateManager.switch`]].
   *
   * **DO NOT OVERRIDE!** Add [[`onLeave`]] instead.
   * @hidden
   */
  public async leave(engine: TEngine) {
    this.world?.pause();

    if (hasOnLeave(this)) {
      await this.onLeave(engine);
    }

    this.events.broadcast({
      type: TEventTypesCore.GameStateLeft,
    });
  }

  /**
   * Called when re-entering state through [[`TGameStateManager.pop`]]
   *
   * **DO NOT OVERRIDE!** Add [[`onLeave`]] instead.
   * @hidden
   */
  public async resume(engine: TEngine, ...args: unknown[]) {
    if (hasOnResume(this)) {
      await this.onResume(engine, ...args);
    }

    this.events.broadcast({
      type: TEventTypesCore.GameStateResumed,
    });
  }

  /**
   * Currently only calls destroy on the world which stops the physics worker
   */
  public async destroy() {
    this.world?.destroy();
  }
}
