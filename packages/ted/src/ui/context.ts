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

export const TEventQueueContext = React.createContext<TEventQueueContextData>({
  events: undefined,
});

export interface TGameContextData {
  [key: string]: unknown;
}

export const TGameContext = React.createContext<TGameContextData>({});

export interface TEngineContextData {
  loading: boolean;
}

export const TEngineContext = React.createContext<TEngineContextData>({
  loading: true,
});

export interface TUIContextData {
  renderingSize: {
    width: number;
    height: number;
  };
  scaling: number;
  showFullscreenToggle: boolean;
  showAudioToggle: boolean;
}

export const TUIContext = React.createContext<TUIContextData>({
  renderingSize: {
    width: 0,
    height: 0,
  },
  scaling: 1,
  showFullscreenToggle: false,
  showAudioToggle: false,
});
