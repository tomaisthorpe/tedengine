import type TEventQueue from '../core/event-queue';
import type { TKeyUpEvent, TKeyDownEvent } from './events';
import { TEventTypesInput } from './events';

// Used to block scrolling when using arrows keys and space
const preventDefaultBehaviour = [
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  ' ', // Space key
];

export default class TKeyboard {
  private keyupListener: (e: KeyboardEvent) => void;
  private keydownListener: (e: KeyboardEvent) => void;

  constructor(eventQueue: TEventQueue) {
    this.keyupListener = (e) => this.handleKeyUp(e, eventQueue);
    this.keydownListener = (e) => this.handleKeyDown(e, eventQueue);

    window.addEventListener('keyup', this.keyupListener);
    window.addEventListener('keydown', this.keydownListener);
  }

  public destroy() {
    window.removeEventListener('keyup', this.keyupListener);
    window.removeEventListener('keydown', this.keydownListener);
  }

  private handleKeyUp(e: KeyboardEvent, eventQueue: TEventQueue) {
    if (preventDefaultBehaviour.includes(e.key)) {
      e.preventDefault();
    }

    let key = e.key;
    if (key === ' ') {
      key = 'Space';
    }

    const event: TKeyUpEvent = {
      type: TEventTypesInput.KeyUp,
      subType: key,
    };

    eventQueue.broadcast(event);
  }

  private handleKeyDown(e: KeyboardEvent, eventQueue: TEventQueue) {
    if (preventDefaultBehaviour.includes(e.key)) {
      e.preventDefault();
    }

    if (e.repeat) {
      return;
    }

    let key = e.key;
    if (key === ' ') {
      key = 'Space';
    }

    const event: TKeyDownEvent = {
      type: TEventTypesInput.KeyDown,
      subType: key,
    };

    eventQueue.broadcast(event);
  }
}
