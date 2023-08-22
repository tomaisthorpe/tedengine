import type TEventQueue from '../core/event-queue';
import type { TMouseMoveEvent, TMouseUpEvent, TMouseDownEvent } from './events';
import { TEventTypesInput } from './events';

// @todo add remove event listeners
export default class TMouse {
  constructor(eventQueue: TEventQueue, private canvas: HTMLCanvasElement) {
    this.addListeners(eventQueue);
  }

  private addListeners(eventQueue: TEventQueue) {
    window.addEventListener('mousemove', (e) => {
      const offset = this.canvas.getBoundingClientRect();
      const event: TMouseMoveEvent = {
        type: TEventTypesInput.MouseMove,
        clientX: e.clientX,
        clientY: e.clientY,
        x: e.clientX - offset.left,
        y: e.clientY - offset.top,
      };

      eventQueue.broadcast(event);
    });

    this.canvas.addEventListener('mouseup', (e) => {
      const event: TMouseUpEvent = {
        type: TEventTypesInput.MouseUp,
        subType: e.button.toString(),
      };

      eventQueue.broadcast(event);
    });

    this.canvas.addEventListener('mousedown', (e) => {
      const event: TMouseDownEvent = {
        type: TEventTypesInput.MouseDown,
        subType: e.button.toString(),
      };

      eventQueue.broadcast(event);
    });
  }
}
