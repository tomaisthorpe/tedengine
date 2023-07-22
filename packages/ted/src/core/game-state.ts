import type { ICamera } from '../cameras/camera';
import type TEngine from '../engine/engine';
import type TActor from './actor';
import TLevel from './level';

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
  onEnter(engine: TEngine, ...args: any[]): Promise<void>;
}

const hasOnEnter = (state: TGameState): state is TGameStateWithOnEnter =>
  (state as TGameStateWithOnEnter).onEnter !== undefined;

export interface TGameStateWithOnResume extends TGameState {
  onResume(engine: TEngine, ...args: any[]): Promise<void>;
}

const hasOnResume = (state: TGameState): state is TGameStateWithOnResume =>
  (state as TGameStateWithOnResume).onResume !== undefined;

export interface TGameStateWithOnLeave extends TGameState {
  onLeave(engine: TEngine): Promise<void>;
}

const hasOnLeave = (state: TGameState): state is TGameStateWithOnLeave =>
  (state as TGameStateWithOnLeave).onLeave !== undefined;

export default class TGameState {
  public created = false;
  public level?: TLevel;

  public activeCamera?: ICamera;

  /**
   * Adds actor to the level in this game state.
   * This is here for convience.
   *
   * @param actor
   */
  public addActor(actor: TActor): void {
    this.level?.addActor(actor);
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
  public async update(engine: TEngine, delta: number): Promise<void> {
    await this.level?.update(engine, delta);

    if (hasOnUpdate(this)) {
      await this.onUpdate(engine, delta);
    }
  }

  public getRenderTasks() {
    return this.level?.getRenderTasks() || [];
  }

  /**
   * Called once before entering the state for the first time
   *
   * **DO NOT OVERRIDE!** Add [[`onCreate`]] instead.
   * @hidden
   */
  public async create(engine: TEngine) {
    this.level = new TLevel(engine);

    await this.level.load();

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
  public async enter(engine: TEngine, ...args: any[]) {
    this.level?.start();

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
    this.level?.pause();

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
  public async resume(engine: TEngine, ...args: any[]) {
    if (hasOnResume(this)) {
      await this.onResume(engine, ...args);
    }
  }

  /**
   * Currently only calls destroy on the level which stops the physics worker
   */
  public async destroy() {
    this.level?.destroy();
  }
}
