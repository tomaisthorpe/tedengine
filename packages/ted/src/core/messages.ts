import type { TEvent } from './event-queue';

export enum TMessageTypesCore {
  EVENT_RELAY = 'event_relay',
}

export interface TMessageEventRelay {
  type: TMessageTypesCore.EVENT_RELAY;
  event: TEvent;
}
