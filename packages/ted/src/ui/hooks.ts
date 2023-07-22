import * as React from 'react';
import type TEventQueue from '../core/event-queue';
import { TEngineContext, TEventQueueContext, TGameContext } from './context';
import type { TEngineContextData, TGameContextData } from './context';

export function useGameContext(): TGameContextData {
  return React.useContext(TGameContext);
}

export function useEngineContext(): TEngineContextData {
  return React.useContext(TEngineContext);
}

export function useEventQueue(): TEventQueue | undefined {
  return React.useContext(TEventQueueContext).events;
}
