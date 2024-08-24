import * as React from 'react';
import type TEventQueue from '../core/event-queue';
import {
  TEngineContext,
  TEventQueueContext,
  TFredContext,
  TGameContext,
  TUIContext,
} from './context';
import type { TEngineContextData, TGameContextData } from './context';
import type TFred from '../fred/fred';

export function useGameContext(): TGameContextData {
  return React.useContext(TGameContext);
}

export function useEngineContext(): TEngineContextData {
  return React.useContext(TEngineContext);
}

export function useEventQueue(): TEventQueue | undefined {
  return React.useContext(TEventQueueContext).events;
}

export function useFred(): TFred | undefined {
  return React.useContext(TFredContext).fred;
}

export function useUIContext() {
  return React.useContext(TUIContext);
}
