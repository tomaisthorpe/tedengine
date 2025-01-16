import type { ICamera } from '../cameras/camera';
import type TEngine from '../engine/engine';
import type {
  TSerializedLighting,
  TSerializedRenderTask,
} from '../renderer/frame-params';
import type TGameState from './game-state';
import type { TWorldUpdateStats } from './world';

export interface TGameStateType {
  new (engine: TEngine): TGameState;
}

export default class TGameStateManager {
  private stateFactories: { [key: string]: TGameStateType } = {};
  private states: { [key: string]: TGameState } = {};
  private stack: TGameState[] = [];
  private loading = false;

  public constructor(private engine: TEngine) {}

  /**
   * Register new state type with the manager.
   * Usually done as game init.
   */
  public register(name: string, state: TGameStateType) {
    this.stateFactories[name] = state;
  }

  /**
   * Pushes a new state onto the stack.
   * It triggers [[`TGameState.onEnter`]] on the new state.
   *
   * It does not trigger [[`TGameState.onLeave`]] on previously active state.
   *
   * @param name state name
   * @param args args to pass to the resumed state
   */
  public async push(name: string, ...args: unknown[]) {
    this.startLoading();

    if (!this.isValidState(name)) {
      throw new Error(`Game State '${name}' does not exist`);
    }

    // If state hasn't been created, then create it
    if (!this.states[name]) {
      await this.createState(name);
    }

    // Push this state onto the steack
    this.stack.push(this.states[name]);

    await this.current()?.enter(this.engine, ...args);

    this.doneLoading();
  }

  /**
   * Triggers [[`TGameState.onLeave`]] on current state, removes from it from the stack.
   * Makes the state below the current state and then calls [[`TGameState.onResume``]]
   *
   * It does not trigger [[`TGameState.onEnter`]].
   *
   * @param name state name
   * @param args args to pass to the resumed state
   */
  public async pop(...args: unknown[]) {
    this.startLoading();

    if (this.stack.length === 0) {
      throw new Error(`No game states to pop`);
    }

    await this.current()?.leave(this.engine);
    this.stack.pop();

    await this.current()?.resume(this.engine, ...args);

    this.doneLoading();
  }

  /**
   * Switches the current active state with the provided one.
   * Triggers [[`TGameState.onLeave`]] on the previously active state, then [[`TGameState.onEnter`]] on the new state.
   *
   * @param name state name
   * @param args args to pass to the new state
   */
  public async switch(name: string, ...args: unknown[]) {
    this.startLoading();

    if (!this.isValidState(name)) {
      throw new Error(`Game State '${name}' does not exist`);
    }

    await this.current()?.leave(this.engine);

    // If state hasn't been created, then create it
    if (!this.states[name]) {
      await this.createState(name);
    }

    // Pop the last element is there is a state on the stack
    if (this.stack.length > 0) {
      this.stack.pop();
    }

    this.stack.push(this.states[name]);

    await this.current()?.enter(this.engine, ...args);

    this.doneLoading();
  }

  public async update(delta: number): Promise<TWorldUpdateStats | undefined> {
    if (this.loading) return;

    return await this.current()?.update(this.engine, delta);
  }

  public getRenderTasks(): TSerializedRenderTask[] {
    const current = this.current();
    if (!current) return [];

    return current.getRenderTasks();
  }

  public getLighting(): TSerializedLighting {
    return this.current()?.getLighting() || {};
  }

  public getActiveCamera(): ICamera | undefined {
    return this.current()?.activeCamera;
  }

  /**
   * Returns the current active state or undefined if no state active.
   */
  public current(): TGameState | undefined {
    if (this.stack.length === 0) {
      return undefined;
    }

    return this.stack[this.stack.length - 1];
  }

  private async createState(name: string) {
    const state = new this.stateFactories[name](this.engine);
    await state.create(this.engine);

    this.states[name] = state;
  }

  private isValidState(name: string): boolean {
    if (this.states[name]) {
      return true;
    }

    if (this.stateFactories[name]) {
      return true;
    }

    return false;
  }

  private startLoading() {
    this.loading = true;
    this.engine.updateEngineContext({ loading: true });
  }

  private doneLoading() {
    this.loading = false;
    this.engine.updateEngineContext({ loading: false });
  }
}
