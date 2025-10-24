import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import type { TEventQueue } from '../../core/event-queue';
import type { TDebugPanelRowSerializedData } from '../../debug/debug-panel-row';
import type { TDebugActionEvent } from '../../debug/events';
import { TEventTypesDebug } from '../../debug/events';
import { DebugPanelColorPickerRow } from './DebugPanelColorPickerRow';

interface Props {
  row: TDebugPanelRowSerializedData;
  events: TEventQueue;
}

const RowContainer = styled.div`
  display: flex;
  min-width: 100px;
  align-items: center;
  padding: 2px 0;
`;

const RowLabel = styled.div<{ clickable?: boolean }>`
  color: #ddd;
  white-space: nowrap;
  min-width: 100px;
  margin-right: 10px;
  cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
  user-select: none;
`;

const RowValue = styled.div`
  font-weight: bold;
  margin-left: auto;
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

const ValueRow = ({ row }: { row: TDebugPanelRowSerializedData }) => {
  const value = row.data.value;

  // If the value contains parentheses, style them as subtle/secondary info
  if (typeof value === 'string' && value.includes('(')) {
    const parts = value.split(/(\([^)]*\))/);
    return (
      <RowValue>
        {parts.map((part, i) => {
          if (part.match(/\([^)]*\)/)) {
            return (
              <span key={i} style={{ opacity: 0.5, fontSize: '0.9em' }}>
                {part}
              </span>
            );
          }
          return part;
        })}
      </RowValue>
    );
  }

  return <RowValue>{value}</RowValue>;
};

const ButtonsRow = ({
  row,
  events,
}: {
  row: TDebugPanelRowSerializedData;
  events: TEventQueue;
}) => (
  <div style={{ marginLeft: 'auto' }}>
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
    <RowInputContainer style={{ marginLeft: 'auto' }}>
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
    <RowInputContainer style={{ marginLeft: 'auto' }}>
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
  <div style={{ marginLeft: 'auto' }}>
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
  </div>
);

const ColorPickerRow = ({
  row,
  events,
}: {
  row: TDebugPanelRowSerializedData;
  events: TEventQueue;
}) => (
  <div style={{ marginLeft: 'auto' }}>
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
  </div>
);

const typeToComponent: {
  [key: string]: ({
    row,
    events,
  }: {
    row: TDebugPanelRowSerializedData;
    events: TEventQueue;
  }) => JSX.Element;
} = {
  value: ValueRow,
  buttons: ButtonsRow,
  input: InputRow,
  checkbox: CheckboxRow,
  select: SelectRow,
  colorPicker: ColorPickerRow,
};

const ExpandArrow = styled.span<{ isExpanded: boolean }>`
  cursor: pointer;
  user-select: none;
  display: inline-block;
  opacity: 0.5;
  transition: transform 0.2s;
  transform: rotate(${(props) => (props.isExpanded ? '0deg' : '-90deg')});
  font-size: 0.7rem !important;
  line-height: 1;
  margin-right: 5px;

  &:hover {
    opacity: 0.7;
  }
`;

const getRowStorageKey = (rowLabel: string) => {
  const pathPrefix = window.location.pathname.replace(/\//g, '_') || 'root';
  return `debugPanel_${pathPrefix}_row_${rowLabel}`;
};

export function DebugPanelRow({ row, events }: Props) {
  const hasChildren =
    row.hasChildren && row.children && row.children.length > 0;

  const storageKey = getRowStorageKey(row.label);

  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    if (!hasChildren) return false;

    const stored = sessionStorage.getItem(storageKey);
    if (stored !== null) {
      return stored === 'true';
    }
    // Default: auto-expand if 10 or fewer children
    return !!(row.children && row.children.length <= 10);
  });

  const RowComponent = typeToComponent[row.type];

  if (!RowComponent) {
    return null;
  }

  const handleToggle = () => {
    if (hasChildren) {
      const newState = !isExpanded;
      setIsExpanded(newState);
      sessionStorage.setItem(storageKey, String(newState));
    }
  };

  return (
    <>
      <RowContainer>
        {hasChildren && (
          <ExpandArrow isExpanded={isExpanded} onClick={handleToggle}>
            ▼
          </ExpandArrow>
        )}
        {!hasChildren && (
          <span
            style={{
              width: '10px',
              display: 'inline-block',
            }}
          />
        )}
        {row.label && (
          <RowLabel clickable={hasChildren} onClick={handleToggle}>
            {row.label}
          </RowLabel>
        )}
        <RowComponent row={row} events={events} />
      </RowContainer>
      {hasChildren && isExpanded && row.children && (
        <div style={{ marginLeft: '15px' }}>
          {row.children.map((child) => (
            <DebugPanelRow key={child.uuid} row={child} events={events} />
          ))}
        </div>
      )}
    </>
  );
}
