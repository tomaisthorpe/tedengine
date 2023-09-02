import type { TMessageEventRelay } from './messages';
import { TMessageTypesCore } from './messages';

export interface TEvent {
  type: string;
  subType?: string;
  payload?: object;
}

/**
 * Processes all event handling across the game.
 *
 * You can provide Web Workers to the constructor to relay any events this queue receives.
 */
export default class TEventQueue {
  private queue: TEvent[] = [];
  private listeners: { [key: string]: Array<(event: TEvent) => void> } = {};

  /**
   * @param relayTo workers to rely all events to
   */
  constructor(private relayTo: MessagePort[] = []) {}

  /**
   * Adds the event to the event queue, ready to be processed.
   *
   * @param {TEvent} event
   */
  public broadcast(event: TEvent, dontRelay?: boolean): void {
    this.queue.push(event);

    if (dontRelay) return;

    for (const port of this.relayTo) {
      port.postMessage({
        type: TMessageTypesCore.EVENT_RELAY,
        event,
      } as TMessageEventRelay);
    }
  }

  /**
   * Add event listener for the given event type with optional sub type.
   *
   * @param {string} event type
   * @param {(IEvent) => void} listener
   */
  public addListener<T extends TEvent>(
    type: string,
    func: (event: T) => void
  ): void;
  public addListener<T extends TEvent>(
    type: string,
    subType: string,
    func: (event: T) => void
  ): void;
  public addListener<T extends TEvent>(
    type: string,
    subTypeOrFunc: string | ((event: T) => void),
    func?: (event: T) => void
  ): void {
    let callback = func;
    if (!func) {
      callback = subTypeOrFunc as (event: T) => void;
    }

    let typeString = type;
    if (typeof subTypeOrFunc === 'string') {
      typeString = `${type}-${subTypeOrFunc as string}`;
    }

    if (this.listeners[typeString] === undefined) {
      this.listeners[typeString] = [callback as (event: TEvent) => void];
    } else {
      this.listeners[typeString].push(callback as (event: TEvent) => void);
    }
  }

  /**
   * Removes listener using the given id and function.
   *
   * @param {string} event id
   * @param {(TEvent) => void} listener
   */
  public removeListener<T extends TEvent>(
    type: string,
    func: (event: T) => void
  ): void;
  public removeListener<T extends TEvent>(
    type: string,
    subType: string,
    func: (event: T) => void
  ): void;
  public removeListener<T extends TEvent>(
    type: string,
    subTypeOrFunc: string | ((event: T) => void),
    func?: (event: T) => void
  ): void {
    let callback = func;
    if (!func) {
      callback = subTypeOrFunc as (event: T) => void;
    }

    let typeString = type;
    if (typeof subTypeOrFunc === 'string') {
      typeString = `${type}-${subTypeOrFunc as string}`;
    }

    // Check there's a listener with this type
    if (this.listeners[typeString] !== undefined) {
      // Remove any functions that are equal to the given one
      this.listeners[typeString] = this.listeners[typeString].filter(
        (f) => f !== callback
      );
    }
  }

  public update(): void {
    // Loop the queue
    for (const event of this.queue) {
      // Check if there are listeners for this event
      if (this.listeners[event.type] !== undefined) {
        for (const listener of this.listeners[event.type]) {
          // Call the listener
          listener(event);
        }
      }

      // If event has subtype check if there are listeners
      if (event.subType) {
        if (this.listeners[`${event.type}-${event.subType}`] !== undefined) {
          for (const listener of this.listeners[
            `${event.type}-${event.subType}`
          ]) {
            // Call the listener
            listener(event);
          }
        }
      }
    }

    // Empty the queue
    this.queue = [];
  }
}
