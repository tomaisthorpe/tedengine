import type { IChildEventQueue, TEvent } from './event-queue';

export default class TProxyEventQueue implements IChildEventQueue {
  constructor(private eventQueueFunc: () => IChildEventQueue | undefined) {}

  public broadcast(event: TEvent, dontRelay?: boolean): void {
    this.eventQueueFunc()?.broadcast(event, dontRelay);
  }
}
