import type TEventQueue from '../core/event-queue';
import type { TMouseMoveEvent, TMouseUpEvent, TMouseDownEvent } from './events';
import { TEventTypesInput } from './events';

// @todo add remove event listeners
export default class TMouse {
  constructor(eventQueue: TEventQueue) {
    this.addListeners(eventQueue);
  }

  private addListeners(eventQueue: TEventQueue) {
    window.addEventListener('mousemove', (e) => {
      const event: TMouseMoveEvent = {
        type: TEventTypesInput.MouseMove,
        clientX: e.clientX,
        clientY: e.clientY,
      };

      eventQueue.broadcast(event);
    });

    window.addEventListener('mouseup', (e) => {
      const event: TMouseUpEvent = {
        type: TEventTypesInput.MouseUp,
        subType: e.button.toString(),
      };

      eventQueue.broadcast(event);
    });

    window.addEventListener('mousedown', (e) => {
      const event: TMouseDownEvent = {
        type: TEventTypesInput.MouseDown,
        subType: e.button.toString(),
      };

      eventQueue.broadcast(event);
    });
  }
}
