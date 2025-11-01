import type { TCameraSystem } from '../cameras/camera-system';
import type { TEngine } from '../engine/engine';
import type {
  TSerializedLighting,
  TSerializedRenderTask,
} from '../renderer/frame-params';
import type { TGameState } from './game-state';
import type { TSegmentTimingContext } from '../debug/segment-timer';

export interface TGameStateType {
  new (engine: TEngine): TGameState;
}

export class TGameStateManager {
  private stateFactories: Record<string, TGameStateType | undefined> = {};
  private states: Record<string, TGameState | undefined> = {};
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

    const state = this.states[name];
    if (!state) {
      throw new Error(`Failed to create game state '${name}'`);
    }

    // Push this state onto the stack
    this.stack.push(state);

    await this.current()?.enter(this.engine, ...args);

    this.doneLoading();
  }

  /**
   * Triggers [[`TGameState.onLeave`]] on current state, removes from it from the stack.
   * Makes the state below the current state and then calls [[`TGameState.onResume`]]
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

    const state = this.states[name];
    if (!state) {
      throw new Error(`Failed to create game state '${name}'`);
    }

    // Pop the last element is there is a state on the stack
    if (this.stack.length > 0) {
      this.stack.pop();
    }

    this.stack.push(state);

    await this.current()?.enter(this.engine, ...args);

    this.doneLoading();
  }

  public async update(
    delta: number,
    timingSegment?: TSegmentTimingContext,
  ): Promise<void> {
    if (this.loading) return;

    await this.current()?.update(this.engine, delta, timingSegment);
  }

  public getRenderTasks(): TSerializedRenderTask[] {
    const current = this.current();
    if (!current) return [];

    return current.getRenderTasks();
  }

  public getLighting(): TSerializedLighting {
    return this.current()?.getLighting() ?? {};
  }

  public getActiveCamera(): TCameraSystem | undefined {
    return this.current()?.world?.cameraSystem;
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
    const factory = this.stateFactories[name];
    if (!factory) {
      throw new Error(`Game state factory '${name}' not found`);
    }

    const state = new factory(this.engine);
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
