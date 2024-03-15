import TEventQueue from '../core/event-queue';
import type TPawn from '../core/pawn';
import { TEventTypesInput } from './events';
import type { TMouseLocation, TMouseMoveEvent } from './events';
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
  private possessing?: TPawn;
  private events: TEventQueue = new TEventQueue();
  private axes: { [key: string]: number } = {};

  public mouseLocation?: TMouseLocation;

  constructor(private engineEventQueue: TEventQueue) {}

  // @todo add validation on button
  // @todo add support for different event types
  public addActionFromMouseEvent(action: string, button: number): void {
    this.engineEventQueue.addListener<TMouseDownEvent>(
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

    this.engineEventQueue.addListener<TMouseUpEvent>(
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
    this.engineEventQueue.addListener<TKeyDownEvent>(
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

    this.engineEventQueue.addListener<TKeyUpEvent>(
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

    this.engineEventQueue.addListener<TKeyDownEvent>(
      TEventTypesInput.KeyDown,
      key,
      (e) => {
        this.axes[axis] += scale;
      },
    );

    this.engineEventQueue.addListener<TKeyUpEvent>(
      TEventTypesInput.KeyUp,
      key,
      (e) => {
        this.axes[axis] -= scale;
      },
    );
  }

  public enableMouseTracking() {
    this.engineEventQueue.addListener<TMouseMoveEvent>(
      TEventTypesInput.MouseMove,
      (e) => {
        const { client, screen, clip } = e;
        this.mouseLocation = {
          client,
          screen,
          clip,
        };
      },
    );
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
}
