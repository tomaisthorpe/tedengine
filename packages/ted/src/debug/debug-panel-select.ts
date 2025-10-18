import type { TEventQueue } from '../core/event-queue';
import type { TEngine } from '../engine/engine';
import type { TDebugPanelRowSerializedData } from './debug-panel-row';
import { TDebugPanelRow } from './debug-panel-row';
import type { IDebugPanelRow } from './debug-panel-row';
import type { TDebugActionEvent } from './events';
import { TEventTypesDebug } from './events';

export interface TDebugSelectOption {
  label: string;
  value: string;
}

export class TDebugPanelSelect
  extends TDebugPanelRow
  implements IDebugPanelRow
{
  public type = 'select';
  public value: string;

  constructor(
    private events: TEventQueue,
    label: string,
    public options: TDebugSelectOption[],
    startingValue: string,
    private onValueChange: (value: string) => void,
  ) {
    super(label);

    this.value = startingValue;

    this.onChange = this.onChange.bind(this);

    this.events.addListener<TDebugActionEvent>(
      TEventTypesDebug.Action,
      this.uuid,
      (e: TDebugActionEvent) => {
        this.onChange(e.data);
      },
    );
  }

  public onChange(value: string) {
    this.value = value;
    this.onValueChange(this.value);
  }

  public update(engine: TEngine, delta: number) {
    return;
  }

  public getData(): TDebugPanelRowSerializedData {
    return {
      ...this.getBaseData(),
      type: this.type,
      data: {
        value: this.value,
        options: this.options,
      },
    };
  }
}
