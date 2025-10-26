import { useCallback, useEffect, useState } from 'react';
import { useEventQueue, useFred } from '../hooks';
import { TEventTypesInput } from '../../input/events';
import styled from 'styled-components';

const FocusBox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(51, 51, 102, 1);
  width: 100%;
  height: 100%;
  font-family: sans-serif;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
`;

export function PointerLock() {
  const [desired, setDesired] = useState(false);
  const [acquired, setAcquired] = useState(false);

  const fred = useFred();
  const events = useEventQueue();

  const onFocus = () => {
    fred?.canvas?.requestPointerLock();
  };

  const pointerLockChange = useCallback(() => {
    if (document.pointerLockElement) {
      setAcquired(true);
      events?.broadcast({ type: TEventTypesInput.PointerLockAcquired });
    } else {
      setAcquired(false);
      events?.broadcast({ type: TEventTypesInput.PointerLockReleased });
    }
  }, [events]);

  useEffect(() => {
    if (!events) return;

    events.addListener(TEventTypesInput.PointerLockRequest, () => {
      setDesired(true);
    });

    document.addEventListener('pointerlockchange', pointerLockChange);
    return () => {
      document.removeEventListener('pointerlockchange', pointerLockChange);
    };
  }, [events, pointerLockChange]);

  if (desired && !acquired) {
    return <FocusBox onClick={() => onFocus()}>Click to focus</FocusBox>;
  }
  return null;
}
