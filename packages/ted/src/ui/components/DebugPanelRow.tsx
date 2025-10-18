import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import type { TEventQueue } from '../../core/event-queue';
import type { TDebugPanelRowSerializedData } from '../../debug/debug-panel-row';
import type { TDebugActionEvent } from '../../debug/events';
import { TEventTypesDebug } from '../../debug/events';
import type { TFredStats } from '../../fred/fred';
import { DebugPanelColorPickerRow } from './DebugPanelColorPickerRow';

interface Props {
  row: TDebugPanelRowSerializedData;
  events: TEventQueue;
  fredValues: TFredStats;
}

const RowContainer = styled.div`
  display: flex;
  min-width: 100px;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
`;

const RowLabel = styled.div`
  margin-right: 10px;
  color: #ddd;
`;

const RowValue = styled.div`
  font-weight: bold;
`;

const RowButton = styled.button`
  font-weight: bold;
  padding: 2px 4px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-right: 5px;
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  &:last-child {
    margin-right: 0;
  }
`;

const RowInput = styled.input`
  font-weight: bold;
  padding: 2px 4px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 150px;
  margin-left: 10px;
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const RowInputValueBubble = styled.div`
  position: absolute;
  background: rgb(25, 25, 25);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2px 4px;
  display: none;
  z-index: 1001;
`;

const RowInputContainer = styled.div`
  position: relative;

  &:hover ${RowInputValueBubble} {
    display: block;
  }
`;

const RowSelect = styled.select`
  font-weight: bold;
  padding: 2px 4px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const RowOption = styled.option`
  font-weight: bold;
  background-color: #333;
`;

const FredValueRow = ({
  row,
  fredValues,
}: {
  row: TDebugPanelRowSerializedData;
  fredValues: TFredStats;
}) => <RowValue>{(fredValues as any)[row.data.value]}</RowValue>;

const ValueRow = ({ row }: { row: TDebugPanelRowSerializedData }) => (
  <RowValue>{row.data.value}</RowValue>
);

const ButtonsRow = ({
  row,
  events,
}: {
  row: TDebugPanelRowSerializedData;
  events: TEventQueue;
}) => (
  <div>
    {row.data.buttons.map((button: any) => (
      <RowButton
        key={button.uuid}
        onClick={() => {
          const event: TDebugActionEvent = {
            type: TEventTypesDebug.Action,
            subType: button.uuid,
          };
          events.broadcast(event);
        }}
      >
        {button.label}
      </RowButton>
    ))}
  </div>
);

const InputRow = ({
  row,
  events,
}: {
  row: TDebugPanelRowSerializedData;
  events: TEventQueue;
}) => {
  const inputRef = useRef();
  const [left, updateLeft] = useState(0);

  useEffect(() => {
    if (row.data.inputType !== 'range') {
      return;
    }

    const input = inputRef.current! as HTMLInputElement;
    const width = input.clientWidth - 18;

    const min = parseFloat(row.data.inputProps.min);
    const max = parseFloat(row.data.inputProps.max);
    const val = parseFloat(row.data.value);
    const per = (val - min) / (max - min);

    updateLeft(per * width + 18);
  }, [
    row.data.value,
    row.data.inputType,
    row.data.inputProps.min,
    row.data.inputProps.max,
  ]);

  return (
    <RowInputContainer>
      <RowInput
        ref={inputRef}
        type={row.data.inputType}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const event: TDebugActionEvent = {
            type: TEventTypesDebug.Action,
            subType: row.uuid,
            data: e.target.value,
          };
          events.broadcast(event);
        }}
        value={row.data.value}
        {...row.data.inputProps}
      />
      {row.data.inputProps.showValueBubble && (
        <RowInputValueBubble style={{ left: `${left}px` }}>
          {row.data.value}
        </RowInputValueBubble>
      )}
    </RowInputContainer>
  );
};

const CheckboxRow = ({
  row,
  events,
}: {
  row: TDebugPanelRowSerializedData;
  events: TEventQueue;
}) => {
  return (
    <RowInputContainer>
      <RowInput
        checked={row.data.value}
        type="checkbox"
        onChange={() => {
          const event: TDebugActionEvent = {
            type: TEventTypesDebug.Action,
            subType: row.uuid,
            data: !row.data.value,
          };
          events.broadcast(event);
        }}
      />
    </RowInputContainer>
  );
};

const SelectRow = ({
  row,
  events,
}: {
  row: TDebugPanelRowSerializedData;
  events: TEventQueue;
}) => (
  <RowSelect
    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
      const event: TDebugActionEvent = {
        type: TEventTypesDebug.Action,
        subType: row.uuid,
        data: e.target.value,
      };
      events.broadcast(event);
    }}
    value={row.data.value}
  >
    {row.data.options.map((option: any) => (
      <RowOption value={option.value} key={option.value}>
        {option.label}
      </RowOption>
    ))}
  </RowSelect>
);

const ColorPickerRow = ({
  row,
  events,
}: {
  row: TDebugPanelRowSerializedData;
  events: TEventQueue;
}) => (
  <DebugPanelColorPickerRow
    color={row.data.value}
    onChange={(color) => {
      const event: TDebugActionEvent = {
        type: TEventTypesDebug.Action,
        subType: row.uuid,
        data: color,
      };
      events.broadcast(event);
    }}
  />
);

const typeToComponent: {
  [key: string]: ({
    row,
    events,
  }: {
    row: TDebugPanelRowSerializedData;
    events: TEventQueue;
    fredValues: TFredStats;
  }) => JSX.Element;
} = {
  value: ValueRow,
  buttons: ButtonsRow,
  input: InputRow,
  checkbox: CheckboxRow,
  select: SelectRow,
  fredValue: FredValueRow,
  colorPicker: ColorPickerRow,
};

export function DebugPanelRow({ row, events, fredValues }: Props) {
  const RowComponent = typeToComponent[row.type];

  if (!RowComponent) {
    return null;
  }
  return (
    <RowContainer
      style={{
        paddingLeft: row.data.indentLevel
          ? `${row.data.indentLevel * 10}px`
          : 0,
      }}
    >
      {row.label && <RowLabel>{row.label}</RowLabel>}
      <RowComponent row={row} events={events} fredValues={fredValues} />
    </RowContainer>
  );
}
