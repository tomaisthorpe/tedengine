import type { vec3 } from 'gl-matrix';
import type { TEventQueue } from '../core/event-queue';
import type { TEngine } from '../engine/engine';
import type { TDebugPanelRowSerializedData } from './debug-panel-row';
import { TDebugPanelRow } from './debug-panel-row';
import type { IDebugPanelRow } from './debug-panel-row';
import type { TDebugActionEvent } from './events';
import { TEventTypesDebug } from './events';

export class TDebugPanelColorPicker
  extends TDebugPanelRow
  implements IDebugPanelRow
{
  public type = 'colorPicker';
  public value: vec3;

  constructor(
    private events: TEventQueue,
    label: string,
    startingValue: vec3,
    private onValueChange: (value: vec3) => void,
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

  public onChange(value: vec3) {
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
      },
    };
  }
}
