import { useState } from 'react';
import styled, { css } from 'styled-components';
import type TEventQueue from '../../core/event-queue';
import type { TDebugPanelSectionSerializedData } from '../../debug/debug-panel-section';
import type { TFredStats } from '../../fred/fred';
import DebugPanelRow from './DebugPanelRow';

const SectionContainer = styled.div`
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);

  &:last-child {
    border-bottom: 0;
  }
`;

interface SectionLabelProps {
  readonly open?: boolean;
}

const SectionLabel = styled.div<SectionLabelProps>`
  margin-right: 10px;
  color: orangered;
  font-weight: bold;
  font-size: 0.7rem;
  cursor: pointer;
  user-select: none;

  &::before {
    content: '▼';
    display: inline-block;
    transform: ${(props) => css`rotate(${props.open ? '0deg' : '-90deg'})`};
    margin-right: 5px;
    color: orangered;
    opacity: 0.5;
    transition: transform 0.2s;
  }
`;

interface Props {
  section: TDebugPanelSectionSerializedData;
  events: TEventQueue;
  fredValues: TFredStats;
}

export default function DebugPanelSection({
  section,
  events,
  fredValues,
}: Props) {
  const [open, setOpen] = useState(section.startOpen);
  return (
    <SectionContainer>
      <SectionLabel open={open} onClick={() => setOpen(!open)}>
        {section.name}
      </SectionLabel>
      {open &&
        section.rows.map((row) => (
          <DebugPanelRow
            key={row.uuid}
            row={row}
            events={events}
            fredValues={fredValues}
          />
        ))}
    </SectionContainer>
  );
}
