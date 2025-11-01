import type { TMessageEventRelay } from './messages';
import { TMessageTypesCore } from './messages';

export interface TEvent {
  type: string;
  subType?: string;
  payload?: object;
}

export interface IChildEventQueue {
  broadcast(event: TEvent, dontRelay?: boolean): void;
}

/**
 * Processes all event handling across the game.
 *
 * You can provide Web Workers to the constructor to relay any events this queue receives.
 */
export class TEventQueue {
  private queue: TEvent[] = [];
  private listeners: Record<
    string,
    Array<(event: TEvent) => void> | undefined
  > = {};

  /**
   * @param relayTo workers to rely all events to
   */
  constructor(
    private relayTo: MessagePort[] = [],
    private childQueues: IChildEventQueue[] = [],
  ) {}

  /**
   * Adds the event to the event queue, ready to be processed.
   *
   * @param {TEvent} event
   */
  public broadcast(event: TEvent, dontRelay?: boolean): void {
    this.queue.push(event);

    // Relay the event to any child queues
    for (const childQueue of this.childQueues) {
      childQueue.broadcast(event, true);
    }

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
    func: (event: T) => void,
  ): void;
  public addListener<T extends TEvent>(
    type: string,
    subType: string,
    func: (event: T) => void,
  ): void;
  public addListener<T extends TEvent>(
    type: string,
    subTypeOrFunc: string | ((event: T) => void),
    func?: (event: T) => void,
  ): void {
    let callback: ((event: T) => void) | undefined = func;
    if (!func) {
      callback = subTypeOrFunc as (event: T) => void;
    }

    if (!callback) {
      throw new Error('No callback function provided to addListener');
    }

    let typeString = type;
    if (typeof subTypeOrFunc === 'string') {
      typeString = `${type}-${subTypeOrFunc as string}`;
    }

    const listeners = this.listeners[typeString] ?? [];
    listeners.push(callback as (event: TEvent) => void);
    this.listeners[typeString] = listeners;
  }

  /**
   * Removes listener using the given id and function.
   *
   * @param {string} event id
   * @param {(TEvent) => void} listener
   */
  public removeListener<T extends TEvent>(
    type: string,
    func: (event: T) => void,
  ): void;
  public removeListener<T extends TEvent>(
    type: string,
    subType: string,
    func: (event: T) => void,
  ): void;
  public removeListener<T extends TEvent>(
    type: string,
    subTypeOrFunc: string | ((event: T) => void),
    func?: (event: T) => void,
  ): void {
    let callback: ((event: T) => void) | undefined = func;
    if (!func) {
      callback = subTypeOrFunc as (event: T) => void;
    }

    if (!callback) {
      throw new Error('No callback function provided to removeListener');
    }

    let typeString = type;
    if (typeof subTypeOrFunc === 'string') {
      typeString = `${type}-${subTypeOrFunc as string}`;
    }

    // Check there's a listener with this type
    const listeners = this.listeners[typeString];
    if (listeners !== undefined) {
      // Remove any functions that are equal to the given one
      this.listeners[typeString] = listeners.filter((f) => f !== callback);
    }
  }

  public update(): void {
    // Loop the queue
    for (const event of this.queue) {
      // Check if there are listeners for this event
      const typeListeners = this.listeners[event.type];
      if (typeListeners !== undefined) {
        for (const listener of typeListeners) {
          // Call the listener
          listener(event);
        }
      }

      // If event has subtype check if there are listeners
      if (event.subType) {
        const subTypeListeners =
          this.listeners[`${event.type}-${event.subType}`];
        if (subTypeListeners !== undefined) {
          for (const listener of subTypeListeners) {
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
