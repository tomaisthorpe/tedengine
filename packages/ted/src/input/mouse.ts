import type { mat4 } from 'gl-matrix';
import { vec2 } from 'gl-matrix';
import type { TEventQueue } from '../core/event-queue';
import type {
  TMouseMoveEvent,
  TMouseUpEvent,
  TMouseDownEvent,
  TMouseLocation,
  TMouseMovement,
} from './events';
import { TEventTypesInput } from './events';

export interface IProjectionContext {
  projectionMatrix?: mat4;
}

export class TMouse {
  private mouseMoveListener: (e: MouseEvent) => void;
  private mouseUpListener: (e: MouseEvent) => void;
  private mouseDownListener: (e: MouseEvent) => void;

  constructor(
    eventQueue: TEventQueue,
    private canvas: HTMLCanvasElement,
  ) {
    this.mouseMoveListener = (e) => this.handleMouseMove(e, eventQueue);
    this.mouseMoveListener = this.mouseMoveListener.bind(this);
    window.addEventListener('mousemove', this.mouseMoveListener);

    this.mouseUpListener = (e) => this.handleMouseUp(e, eventQueue);
    this.mouseUpListener = this.mouseUpListener.bind(this);
    this.canvas.addEventListener('mouseup', this.mouseUpListener);

    this.mouseDownListener = (e) => this.handleMouseDown(e, eventQueue);
    this.mouseDownListener = this.mouseDownListener.bind(this);
    this.canvas.addEventListener('mousedown', this.mouseDownListener);
  }

  public destroy() {
    window.removeEventListener('mousemove', this.mouseMoveListener);
    this.canvas.removeEventListener('mouseup', this.mouseUpListener);
    this.canvas.removeEventListener('mousedown', this.mouseDownListener);
  }

  private handleMouseMove(e: MouseEvent, eventQueue: TEventQueue) {
    const event: TMouseMoveEvent = {
      type: TEventTypesInput.MouseMove,
      ...this.getMouseLocation(e),
      movement: this.getMouseMovement(e),
    };

    eventQueue.broadcast(event);
  }

  private handleMouseUp(e: MouseEvent, eventQueue: TEventQueue) {
    const event: TMouseUpEvent = {
      type: TEventTypesInput.MouseUp,
      subType: e.button.toString(),
      ...this.getMouseLocation(e),
    };

    eventQueue.broadcast(event);
  }

  private handleMouseDown(e: MouseEvent, eventQueue: TEventQueue) {
    const event: TMouseDownEvent = {
      type: TEventTypesInput.MouseDown,
      subType: e.button.toString(),
      ...this.getMouseLocation(e),
    };

    eventQueue.broadcast(event);
  }

  private getMouseLocation(e: MouseEvent) {
    const offset = this.canvas.getBoundingClientRect();

    const result: TMouseLocation = {
      client: vec2.fromValues(e.clientX, e.clientY),
      screen: vec2.fromValues(e.clientX - offset.left, e.clientY - offset.top),
      clip: vec2.fromValues(
        ((e.clientX - offset.left) / this.canvas.clientWidth) * 2 - 1,
        ((e.clientY - offset.top) / this.canvas.clientHeight) * -2 + 1,
      ),
    };

    return result;
  }

  private getMouseMovement(e: MouseEvent): TMouseMovement {
    return {
      client: vec2.fromValues(e.movementX, e.movementY),
      clip: vec2.fromValues(
        e.movementX / this.canvas.clientWidth,
        -e.movementY / this.canvas.clientHeight,
      ),
    };
  }
}
