import type { ICamera } from '../cameras/camera';
import type TEngine from '../engine/engine';
import { TJobContextTypes } from '../jobs/context-types';
import TJobManager from '../jobs/job-manager';
import type TActor from './actor';
import TEventQueue from './event-queue';
import TWorld from './world';
import type { TWorldUpdateStats } from './world';

export interface TGameStateWithOnUpdate extends TGameState {
  onUpdate(engine: TEngine, delta: number): Promise<void>;
}

const hasOnUpdate = (state: TGameState): state is TGameStateWithOnUpdate =>
  (state as TGameStateWithOnUpdate).onUpdate !== undefined;

export interface TGameStateWithOnCreate extends TGameState {
  onCreate(engine: TEngine): Promise<void>;
}

const hasOnCreate = (state: TGameState): state is TGameStateWithOnCreate =>
  (state as TGameStateWithOnCreate).onCreate !== undefined;

export interface TGameStateWithOnEnter extends TGameState {
  onEnter(engine: TEngine, ...args: unknown[]): Promise<void>;
}

const hasOnEnter = (state: TGameState): state is TGameStateWithOnEnter =>
  (state as TGameStateWithOnEnter).onEnter !== undefined;

export interface TGameStateWithOnResume extends TGameState {
  onResume(engine: TEngine, ...args: unknown[]): Promise<void>;
}

const hasOnResume = (state: TGameState): state is TGameStateWithOnResume =>
  (state as TGameStateWithOnResume).onResume !== undefined;

export interface TGameStateWithOnLeave extends TGameState {
  onLeave(engine: TEngine): Promise<void>;
}

const hasOnLeave = (state: TGameState): state is TGameStateWithOnLeave =>
  (state as TGameStateWithOnLeave).onLeave !== undefined;

export interface TGameStateWithBeforeWorldCreate extends TGameState {
  beforeWorldCreate(engine: TEngine): Promise<void>;
}

const hasBeforeWorldCreate = (
  state: TGameState,
): state is TGameStateWithBeforeWorldCreate =>
  (state as TGameStateWithBeforeWorldCreate).beforeWorldCreate !== undefined;

export default class TGameState {
  public created = false;
  public world?: TWorld;

  public activeCamera?: ICamera;

  /**
   * Event queue for the game state which will recieve all events when the state is active.
   */
  public events: TEventQueue = new TEventQueue();

  public jobs: TJobManager;

  constructor(protected engine: TEngine) {
    this.jobs = new TJobManager([TJobContextTypes.GameState], engine.jobs);
    this.jobs.additionalContext = {
      gameState: this,
    };
  }

  /**
   * Adds actor to the world in this game state.
   * This is here for convience.
   *
   * @param actor
   */
  public addActor(actor: TActor): void {
    this.world?.addActor(actor);
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
  ): Promise<TWorldUpdateStats | undefined> {
    this.events.update();

    if (!this.world) return;

    const stats = await this.world.update(engine, delta);

    if (hasOnUpdate(this)) {
      await this.onUpdate(engine, delta);
    }

    return stats;
  }

  public getRenderTasks() {
    return this.world?.getRenderTasks() || [];
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
  }

  /**
   * Currently only calls destroy on the world which stops the physics worker
   */
  public async destroy() {
    this.world?.destroy();
  }
}
