import * as React from 'react';
import type TEventQueue from '../core/event-queue';
import type TFred from '../fred/fred';

export interface TFredContextData {
  fred: TFred | undefined;
}

export const TFredContext = React.createContext<TFredContextData>({
  fred: undefined,
});

export interface TEventQueueContextData {
  events: TEventQueue | undefined;
}

export const TEventQueueContext = React.createContext<TEventQueueContextData>(
  undefined!,
);

export interface TGameContextData {
  [key: string]: any;
}

export const TGameContext = React.createContext<TGameContextData>(undefined!);

export interface TEngineContextData {
  loading: boolean;
}

export const TEngineContext = React.createContext<TEngineContextData>(
  undefined!,
);

export interface TUIContextData {
  renderingSize: {
    width: number;
    height: number;
  };
  scaling: number;
}

export const TUIContext = React.createContext<TUIContextData>(undefined!);
