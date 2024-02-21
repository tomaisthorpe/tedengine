import { mat4, vec3 } from 'gl-matrix';
import type TEventQueue from '../core/event-queue';
import type {
  TMouseMoveEvent,
  TMouseUpEvent,
  TMouseDownEvent,
  TMouseLocation,
} from './events';
import { TEventTypesInput } from './events';

export interface IProjectionContext {
  projectionMatrix?: mat4;
}

export default class TMouse {
  private mouseMoveListener: (e: MouseEvent) => void;
  private mouseUpListener: (e: MouseEvent) => void;
  private mouseDownListener: (e: MouseEvent) => void;

  constructor(
    eventQueue: TEventQueue,
    private canvas: HTMLCanvasElement,
    private projectionContext: IProjectionContext,
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
      clientX: e.clientX,
      clientY: e.clientY,
      x: e.clientX - offset.left,
      y: e.clientY - offset.top,
      px: ((e.clientX - offset.left) / this.canvas.width) * 2 - 1,
      py: ((e.clientY - offset.top) / this.canvas.height) * -2 + 1,
    };

    if (this.projectionContext.projectionMatrix) {
      const projectionMatrix = this.projectionContext.projectionMatrix;
      const invertProj = mat4.invert(mat4.create(), projectionMatrix);

      if (invertProj) {
        const worldspace = vec3.transformMat4(
          vec3.create(),
          [result.px, result.py, 0],
          invertProj,
        );

        result.worldX = worldspace[0];
        result.worldY = worldspace[1];
      }
    }

    return result;
  }
}
