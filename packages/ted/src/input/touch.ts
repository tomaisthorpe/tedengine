import { vec2 } from 'gl-matrix';
import type { TEventQueue } from '../core/event-queue';
import type {
  TMouseLocation,
  TMouseMovement,
  TTouchCancelEvent,
  TTouchEndEvent,
  TTouchMoveEvent,
  TTouchStartEvent,
} from './events';
import { TEventTypesInput } from './events';

export class TMouse {
  private touchMoveListener: (e: TouchEvent) => void;
  private touchStartListener: (e: TouchEvent) => void;
  private touchEndListener: (e: TouchEvent) => void;
  private touchCancelListener: (e: TouchEvent) => void;

  constructor(
    eventQueue: TEventQueue,
    private canvas: HTMLCanvasElement,
  ) {
    this.touchMoveListener = (e) => this.handleTouchMove(e, eventQueue);
    this.touchMoveListener = this.touchMoveListener.bind(this);
    window.addEventListener('touchmove', this.touchMoveListener);

    this.touchStartListener = (e) => this.handleTouchStart(e, eventQueue);
    this.touchStartListener = this.touchStartListener.bind(this);
    this.canvas.addEventListener('touchstart', this.touchStartListener);

    this.touchEndListener = (e) => this.handleTouchEnd(e, eventQueue);
    this.touchEndListener = this.touchEndListener.bind(this);
    this.canvas.addEventListener('touchend', this.touchEndListener);

    this.touchCancelListener = (e) => this.handleTouchCancel(e, eventQueue);
    this.touchCancelListener = this.touchCancelListener.bind(this);
    window.addEventListener('touchcancel', this.touchCancelListener);
  }

  public destroy() {
    window.removeEventListener('touchmove', this.touchMoveListener);
    window.removeEventListener('touchcancel', this.touchCancelListener);
    this.canvas.removeEventListener('touchstart', this.touchStartListener);
    this.canvas.removeEventListener('touchend', this.touchEndListener);
  }

  private handleTouchMove(e: TouchEvent, eventQueue: TEventQueue) {
    const event: TTouchMoveEvent = {
      type: TEventTypesInput.TouchMove,
      ...this.getTouchLocation(e),
      movement: this.getTouchMovement(e),
    };

    eventQueue.broadcast(event);
  }

  private handleTouchStart(e: TouchEvent, eventQueue: TEventQueue) {
    const event: TTouchStartEvent = {
      type: TEventTypesInput.TouchStart,
      ...this.getTouchLocation(e),
    };

    eventQueue.broadcast(event);
  }

  private handleTouchEnd(e: TouchEvent, eventQueue: TEventQueue) {
    const event: TTouchEndEvent = {
      type: TEventTypesInput.TouchEnd,
      ...this.getTouchLocation(e),
    };

    eventQueue.broadcast(event);
  }

  private handleTouchCancel(e: TouchEvent, eventQueue: TEventQueue) {
    const event: TTouchCancelEvent = {
      type: TEventTypesInput.TouchCancel,
      ...this.getTouchLocation(e),
    };

    eventQueue.broadcast(event);
  }

  private getTouchLocation(e: TouchEvent) {
    const offset = this.canvas.getBoundingClientRect();

    const touch = e.touches[0];
    const result: TMouseLocation = {
      client: vec2.fromValues(touch.clientX, touch.clientY),
      screen: vec2.fromValues(
        touch.clientX - offset.left,
        touch.clientY - offset.top,
      ),
      clip: vec2.fromValues(
        ((touch.clientX - offset.left) / this.canvas.clientWidth) * 2 - 1,
        ((touch.clientY - offset.top) / this.canvas.clientHeight) * -2 + 1,
      ),
    };

    return result;
  }

  private getTouchMovement(e: TouchEvent): TMouseMovement {
    const touch = e.touches[0];
    return {
      client: vec2.fromValues(touch.clientX, touch.clientY),
      clip: vec2.fromValues(
        touch.clientX / this.canvas.clientWidth,
        -touch.clientY / this.canvas.clientHeight,
      ),
    };
  }
}
