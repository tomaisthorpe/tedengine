import * as React from 'react';
import type TEventQueue from '../core/event-queue';

export interface TEventQueueContextData {
  events: TEventQueue | undefined;
}

export const TEventQueueContext = React.createContext<TEventQueueContextData>(
  null!
);

export interface TGameContextData {
  [key: string]: any;
}

export const TGameContext = React.createContext<TGameContextData>(null!);

export interface TEngineContextData {
  loading: boolean;
}

export const TEngineContext = React.createContext<TEngineContextData>(null!);
