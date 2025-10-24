import { useEffect, useState } from 'react';
import styled from 'styled-components';
import type { TEventQueue } from '../../core/event-queue';
import type { TDebugPanelSerializedData } from '../../debug/debug-panel';
import type { TDebugUpdateEvent } from '../../debug/events';
import { TEventTypesDebug } from '../../debug/events';
import { DebugPanelSection } from './DebugPanelSection';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  padding: 0 10px;
  background: rgba(41, 37, 54, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);

  color: white;
  font-size: 0.8rem;
  font-family: sans-serif;
  z-index: 100;
`;

interface Props {
  events: TEventQueue;
}

export function DebugPanel({ events }: Props) {
  const [data, setData] = useState<TDebugPanelSerializedData | undefined>(
    undefined,
  );

  useEffect(() => {
    events.addListener<TDebugUpdateEvent>(
      TEventTypesDebug.Update,
      (e: TDebugUpdateEvent) => {
        setData(e.data);
      },
    );
  }, [events]);

  if (!data || !data.isOpen) {
    return null;
  }

  return (
    <Container>
      {data.sections.map((section) => (
        <DebugPanelSection
          key={section.uuid}
          section={section}
          events={events}
        />
      ))}
    </Container>
  );
}
