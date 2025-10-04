import type TEventQueue from '../core/event-queue';
import { TEventTypesWindow, TWindowBlurEvent } from '../fred/events';
import type {
  TKeyDownEvent,
  TKeyUpEvent,
  TMouseDownEvent,
  TMouseLocation,
  TMouseMoveEvent,
  TMouseMovement,
  TMouseUpEvent,
  TPointerLockAcquired,
  TPointerLockReleased,
} from './events';
import { TEventTypesInput } from './events';

export interface TInputState {
  isDown: boolean;
  justPressed: boolean;
  justReleased: boolean;
  timePressed: number;

  value: number;
  previousValue: number;
  delta: number;
}

export enum TInputDevice {
  Keyboard = 'keyboard',
  Mouse = 'mouse',
  Touch = 'touch',
}

export interface TInputKey {
  device: TInputDevice;
  key: string;
}

export class TInputManager {
  private actionMappings: Map<string, TInputKey[]> = new Map();
  private actionStates: Map<string, TInputState> = new Map();
  private rawInputStates: Map<string, TInputState> = new Map();

  private mouseLocation?: TMouseLocation;
  private mouseMovement?: TMouseMovement;

  public pointerLocked = false;

  constructor(private inputEventQueue: TEventQueue) {
    // @todo remove listeners when destroyed
    this.inputEventQueue.addListener<TKeyDownEvent>(
      TEventTypesInput.KeyDown,
      this.handleKeyDown.bind(this),
    );

    this.inputEventQueue.addListener<TKeyUpEvent>(
      TEventTypesInput.KeyUp,
      this.handleKeyUp.bind(this),
    );

    this.inputEventQueue.addListener<TMouseMoveEvent>(
      TEventTypesInput.MouseMove,
      this.handleMouseMove.bind(this),
    );

    this.inputEventQueue.addListener<TMouseUpEvent>(
      TEventTypesInput.MouseUp,
      this.handleMouseUp.bind(this),
    );

    this.inputEventQueue.addListener<TMouseDownEvent>(
      TEventTypesInput.MouseDown,
      this.handleMouseDown.bind(this),
    );

    this.inputEventQueue.addListener<TWindowBlurEvent>(
      TEventTypesWindow.Blur,
      this.handleWindowBlur.bind(this),
    );
  }

  private handleWindowBlur() {
    // Clear all input states
    for (const [key] of this.rawInputStates.entries()) {
      this.setInputState(key, false);
    }
  }

  public mapInput(action: string, key: TInputKey): void {
    if (!this.actionMappings.has(action)) {
      this.actionMappings.set(action, []);
    }

    this.actionMappings.get(action)?.push(key);

    if (!this.actionStates.has(action)) {
      this.actionStates.set(action, {
        isDown: false,
        justPressed: false,
        justReleased: false,
        timePressed: 0,
        value: 0,
        previousValue: 0,
        delta: 0,
      });
    }
  }

  public clearMappings(action: string): void {
    this.actionMappings.delete(action);
  }

  public isActionActive(action: string): boolean {
    const state = this.actionStates.get(action);
    return state?.isDown ?? false;
  }

  public wasActionJustPressed(action: string): boolean {
    const state = this.actionStates.get(action);
    return state?.justPressed ?? false;
  }

  public wasActionJustReleased(action: string): boolean {
    const state = this.actionStates.get(action);
    return state?.justReleased ?? false;
  }

  public getActionState(action: string): TInputState | undefined {
    return this.actionStates.get(action);
  }

  public getActionValue(action: string): number {
    const state = this.getActionState(action);
    return state?.value ?? 0;
  }

  public getMouseLocation(): TMouseLocation | undefined {
    return this.mouseLocation;
  }

  public getMouseMovement(): TMouseMovement | undefined {
    return this.mouseMovement;
  }

  public update(delta: number) {
    for (const [, state] of this.rawInputStates.entries()) {
      if (state.isDown) {
        state.timePressed += delta;
      }
    }

    for (const [action, mappings] of this.actionMappings.entries()) {
      const actionState = this.getActionState(action)!;

      const wasPressed = actionState.isDown;
      actionState.previousValue = actionState.value;

      let isActive = false;
      for (const mapping of mappings) {
        const key = `${mapping.device}:${mapping.key}`;
        const rawState = this.rawInputStates.get(key);
        if (rawState?.isDown) {
          isActive = true;
          break;
        }
      }

      actionState.isDown = isActive;
      actionState.justPressed = !wasPressed && isActive;
      actionState.justReleased = wasPressed && !isActive;

      if (isActive && !wasPressed) {
        actionState.timePressed = 0;
      } else if (isActive) {
        actionState.timePressed += delta;
      } else if (!isActive) {
        actionState.timePressed = 0;
      }
    }

    // Clear justPressed and justReleased
    for (const [, state] of this.rawInputStates.entries()) {
      state.justPressed = false;
      state.justReleased = false;
    }
  }

  private handleKeyDown(e: TKeyDownEvent) {
    const key = `keyboard:${e.subType}`;
    this.setInputState(key, true);
  }

  private handleKeyUp(e: TKeyUpEvent) {
    const key = `keyboard:${e.subType}`;
    this.setInputState(key, false);
  }

  private handleMouseUp(e: TMouseUpEvent) {
    const key = `mouse:${e.subType}`;
    this.setInputState(key, false);
  }

  private handleMouseDown(e: TMouseDownEvent) {
    const key = `mouse:${e.subType}`;
    this.setInputState(key, true);
  }

  private setInputState(key: string, isPressed: boolean) {
    if (!this.rawInputStates.has(key)) {
      // Set default state
      this.rawInputStates.set(key, {
        isDown: false,
        justPressed: false,
        justReleased: false,
        timePressed: 0,
        value: 0,
        previousValue: 0,
        delta: 0,
      });
    }

    const state = this.rawInputStates.get(key)!;
    if (isPressed && !state.isDown) {
      state.justPressed = true;
      state.isDown = true;
      state.timePressed = 0;
    } else if (!isPressed && state.isDown) {
      state.justReleased = true;
      state.isDown = false;
    }

    state.previousValue = state.value;
    state.value = isPressed ? 1 : 0;
    state.delta = state.value - state.previousValue;
  }

  private handleMouseMove(e: TMouseMoveEvent) {
    this.mouseLocation = {
      client: e.client,
      screen: e.screen,
      clip: e.clip,
    };
    this.mouseMovement = e.movement;
  }

  public enablePointerLock() {
    this.inputEventQueue.addListener<TPointerLockAcquired>(
      TEventTypesInput.PointerLockAcquired,
      this.handlePointerLockAcquired.bind(this),
    );

    this.inputEventQueue.addListener<TPointerLockReleased>(
      TEventTypesInput.PointerLockReleased,
      this.handlePointerLockReleased.bind(this),
    );

    this.inputEventQueue.broadcast({
      type: TEventTypesInput.PointerLockRequest,
    });
  }

  private handlePointerLockAcquired() {
    this.pointerLocked = true;
  }

  private handlePointerLockReleased() {
    this.pointerLocked = false;
  }
}
