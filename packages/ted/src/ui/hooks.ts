import * as React from 'react';
import type { TEventQueue } from '../core/event-queue';
import {
  TEngineContext,
  TEventQueueContext,
  TFredContext,
  TGameContext,
  TUIContext,
} from './context';
import type { TEngineContextData, TGameContextData } from './context';
import type { TFred } from '../fred/fred';
import type { TJobManager } from '../jobs';

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

export function useJobs(): TJobManager | undefined {
  const fred = useFred();
  return fred ? fred.jobs : undefined;
}

export function useUIContext() {
  return React.useContext(TUIContext);
}

export function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  React.useEffect(() => {
    let startedInside = false;
    let startedWhenMounted = false;

    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if `mousedown` or `touchstart` started inside ref element
      if (startedInside || !startedWhenMounted) return;
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) return;

      handler(event);
    };

    const validateEventStart = (event: MouseEvent | TouchEvent) => {
      startedWhenMounted = !!ref.current;
      startedInside = !!(
        ref.current && ref.current.contains(event.target as Node)
      );
    };

    document.addEventListener('mousedown', validateEventStart);
    document.addEventListener('touchstart', validateEventStart);
    document.addEventListener('click', listener);

    return () => {
      document.removeEventListener('mousedown', validateEventStart);
      document.removeEventListener('touchstart', validateEventStart);
      document.removeEventListener('click', listener);
    };
  }, [ref, handler]);
}
