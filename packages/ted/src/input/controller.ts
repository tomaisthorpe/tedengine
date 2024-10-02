import TEventQueue from '../core/event-queue';
import type TPawn from '../core/pawn';
import type TEngine from '../engine/engine';
import type { TWindowBlurEvent } from '../fred/events';
import { TEventTypesWindow } from '../fred/events';
import { TEventTypesInput } from './events';
import type {
  TMouseLocation,
  TMouseMoveEvent,
  TPointerLockReleased,
  TPointerLockAcquired,
  TMouseMovement,
} from './events';
import type {
  TKeyDownEvent,
  TKeyUpEvent,
  TMouseUpEvent,
  TMouseDownEvent,
  TActionPressedEvent,
  TActionReleasedEvent,
} from './events';

/**
 * Adds higher level input handling
 *
 * @todo add option to unpossess
 * @todo missing teardown
 * @todo fix issue that controller updates actors a frame behind the input
 */
export default class TController {
  protected possessing?: TPawn;
  private events: TEventQueue = new TEventQueue();
  private axes: { [key: string]: number } = {};

  public mouseLocation?: TMouseLocation;
  public mouseMovement?: TMouseMovement;
  public pointerLocked = false;

  public isDown: { [key: string]: boolean } = {};

  constructor(private inputEventQueue: TEventQueue) {
    this.resetAxisValues = this.resetAxisValues.bind(this);

    // Reset all axis values when the window loses focus
    // This is to prevent axis getting stuck in a pressed state
    inputEventQueue.addListener<TWindowBlurEvent>(
      TEventTypesWindow.Blur,
      this.resetAxisValues,
    );

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    this.inputEventQueue.addListener<TKeyDownEvent>(
      TEventTypesInput.KeyDown,
      this.handleKeyDown,
    );

    this.inputEventQueue.addListener<TKeyUpEvent>(
      TEventTypesInput.KeyUp,
      this.handleKeyUp,
    );
  }

  private handleKeyDown(e: TKeyDownEvent) {
    this.isDown[e.subType] = true;
  }

  private handleKeyUp(e: TKeyUpEvent) {
    this.isDown[e.subType] = false;
  }

  // @todo add validation on button
  // @todo add support for different event types
  public addActionFromMouseEvent(action: string, button: number): void {
    this.inputEventQueue.addListener<TMouseDownEvent>(
      TEventTypesInput.MouseDown,
      button.toString(),
      (e) => {
        const event: TActionPressedEvent = {
          type: TEventTypesInput.ActionPressed,
          subType: action,
        };

        this.events.broadcast(event);
      },
    );

    this.inputEventQueue.addListener<TMouseUpEvent>(
      TEventTypesInput.MouseUp,
      button.toString(),
      (e) => {
        const event: TActionReleasedEvent = {
          type: TEventTypesInput.ActionReleased,
          subType: action,
        };

        this.events.broadcast(event);
      },
    );
  }

  public addActionFromKeyEvent(action: string, key: string): void {
    // Add listener on the engine event queue
    this.inputEventQueue.addListener<TKeyDownEvent>(
      TEventTypesInput.KeyDown,
      key,
      (e) => {
        const event: TActionPressedEvent = {
          type: TEventTypesInput.ActionPressed,
          subType: action,
        };

        this.events.broadcast(event);
      },
    );

    this.inputEventQueue.addListener<TKeyUpEvent>(
      TEventTypesInput.KeyUp,
      key,
      (e) => {
        const event: TActionReleasedEvent = {
          type: TEventTypesInput.ActionReleased,
          subType: action,
        };

        this.events.broadcast(event);
      },
    );
  }

  public addAxisFromKeyEvent(axis: string, key: string, scale: number): void {
    if (this.axes[axis] === undefined) {
      this.axes[axis] = 0;
    }

    this.inputEventQueue.addListener<TKeyDownEvent>(
      TEventTypesInput.KeyDown,
      key,
      (e) => {
        this.axes[axis] += scale;
      },
    );

    this.inputEventQueue.addListener<TKeyUpEvent>(
      TEventTypesInput.KeyUp,
      key,
      (e) => {
        this.axes[axis] -= scale;
      },
    );
  }

  public enableMouseTracking() {
    this.inputEventQueue.addListener<TMouseMoveEvent>(
      TEventTypesInput.MouseMove,
      (e) => {
        const { client, screen, clip, movement } = e;
        this.mouseLocation = {
          client,
          screen,
          clip,
        };

        this.mouseMovement = movement;
      },
    );
  }

  public enablePointerLock(engine: TEngine) {
    // Engine event queue is used to request pointer lock as it is a global event
    engine.events.broadcast({
      type: TEventTypesInput.PointerLockRequest,
    });

    this.handlePointerLockAcquired = this.handlePointerLockAcquired.bind(this);

    engine.events.addListener<TPointerLockAcquired>(
      TEventTypesInput.PointerLockAcquired,
      this.handlePointerLockAcquired,
    );

    this.handlePointerLockRelease = this.handlePointerLockRelease.bind(this);

    engine.events.addListener<TPointerLockReleased>(
      TEventTypesInput.PointerLockReleased,
      this.handlePointerLockRelease,
    );
  }

  private handlePointerLockRelease() {
    this.pointerLocked = false;
  }

  private handlePointerLockAcquired() {
    this.pointerLocked = true;
  }

  /**
   * Returns the current value of an axis or 0 if it is missing.
   *
   * @param axis name of the axis
   */
  public getAxisValue(axis: string): number {
    return this.axes[axis] || 0;
  }

  public possess(actor: TPawn) {
    this.possessing = actor;
    this.possessing.setupController(this);
  }

  /**
   * Binds an action to a callback for states pressed or released.
   *
   * @todo throw error if state is invalid
   */
  public bindAction(action: string, state: string, callback: () => void) {
    if (state === 'pressed') {
      this.events.addListener<TActionPressedEvent>(
        TEventTypesInput.ActionPressed,
        action,
        callback,
      );
    } else if (state === 'released') {
      this.events.addListener<TActionReleasedEvent>(
        TEventTypesInput.ActionReleased,
        action,
        callback,
      );
    }
  }

  public update() {
    this.events.update();
  }

  /**
   * Resets all current axis values to 0.
   */
  private resetAxisValues() {
    Object.keys(this.axes).forEach((key) => {
      this.axes[key] = 0;
    });

    Object.keys(this.isDown).forEach((key) => {
      this.isDown[key] = false;
    });
  }

  /**
   * Tears down the controller and removes all event listeners.
   *
   * @todo add rest of event listeners, including pointer lock change
   */
  public destroy() {
    this.inputEventQueue.removeListener<TWindowBlurEvent>(
      TEventTypesWindow.Blur,
      this.resetAxisValues,
    );

    this.inputEventQueue.removeListener<TKeyDownEvent>(
      TEventTypesInput.KeyDown,
      this.handleKeyDown,
    );

    this.inputEventQueue.removeListener<TKeyUpEvent>(
      TEventTypesInput.KeyUp,
      this.handleKeyUp,
    );
  }
}
