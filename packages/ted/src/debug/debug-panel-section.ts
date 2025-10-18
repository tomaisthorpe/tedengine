import { v4 as uuid } from 'uuid';
import type { TEventQueue } from '../core/event-queue';
import type { TEngine } from '../engine/engine';
import type { TButton } from './debug-panel-buttons';
import { TDebugPanelButtons } from './debug-panel-buttons';
import { TDebugPanelCheckbox } from './debug-panel-checkbox';
import { TDebugPanelFredValue } from './debug-panel-fred-value';
import type { TDebugInputTypes, TDebugInputProps } from './debug-panel-input';
import { TDebugPanelInput } from './debug-panel-input';
import type {
  IDebugPanelRow,
  TDebugPanelRowSerializedData,
} from './debug-panel-row';
import type { TDebugSelectOption } from './debug-panel-select';
import { TDebugPanelSelect } from './debug-panel-select';
import { TDebugPanelValue } from './debug-panel-value';
import type { TUpdateFunction } from './debug-panel-value';
import { TDebugPanelColorPicker } from './debug-panel-color-picker';
import type { vec3 } from 'gl-matrix';

export interface TDebugPanelSectionSerializedData {
  uuid: string;
  name: string;
  startOpen: boolean;
  rows: TDebugPanelRowSerializedData[];
}

export class TDebugPanelSection {
  public rows: IDebugPanelRow[] = [];
  public dead = false;
  public uuid: string;

  constructor(
    protected events: TEventQueue,
    public name: string,
    public startOpen: boolean,
  ) {
    this.uuid = uuid();
  }

  public getData(): TDebugPanelSectionSerializedData {
    return {
      uuid: this.uuid,
      name: this.name,
      startOpen: this.startOpen,
      rows: this.rows.map((row) => row.getData()),
    };
  }

  /**
   * Add new row to the section with string value
   * @param label Text label for row
   * @param updateFunction Function to return value every update
   */
  public addValue(
    label: string,
    updateFunction: TUpdateFunction,
  ): TDebugPanelValue {
    const row = new TDebugPanelValue(label, updateFunction);
    this.rows.push(row);

    return row;
  }

  /**
   * Add new row to the section with string value from Fred stats
   * @param label Text label for row
   */
  public addFredValue(label: string, valueKey: string): TDebugPanelFredValue {
    const row = new TDebugPanelFredValue(label, valueKey);
    this.rows.push(row);

    return row;
  }

  /**
   * Add new row to the section with buttons
   * @param label Text label for row
   * @param buttons Array of buttons for the row
   */
  public addButtons(label: string, ...buttons: TButton[]): TDebugPanelButtons {
    const row = new TDebugPanelButtons(this.events, label, ...buttons);
    this.rows.push(row);

    return row;
  }

  /**
   * Add new row to the section with an input
   */
  public addInput(
    label: string,
    inputType: TDebugInputTypes,
    startingValue: string,
    onChange: (value: string) => void,
    inputProps?: TDebugInputProps,
  ): TDebugPanelInput {
    const row = new TDebugPanelInput(
      this.events,
      label,
      inputType,
      startingValue,
      onChange,
      inputProps,
    );
    this.rows.push(row);

    return row;
  }

  /**
   * Add new row to the section with a checkbox
   */
  public addCheckbox(
    label: string,
    startingValue: boolean,
    onChange: (value: boolean) => void,
  ): TDebugPanelCheckbox {
    const row = new TDebugPanelCheckbox(
      this.events,
      label,
      startingValue,
      onChange,
    );
    this.rows.push(row);

    return row;
  }

  /**
   * Add new row to the section with a select box
   */
  public addSelect(
    label: string,
    options: TDebugSelectOption[],
    startingValue: string,
    onChange: (value: string) => void,
  ) {
    const row = new TDebugPanelSelect(
      this.events,
      label,
      options,
      startingValue,
      onChange,
    );
    this.rows.push(row);

    return row;
  }

  public addColorPicker(
    label: string,
    startingValue: vec3,
    onChange: (value: vec3) => void,
  ): TDebugPanelColorPicker {
    const row = new TDebugPanelColorPicker(
      this.events,
      label,
      startingValue,
      onChange,
    );
    this.rows.push(row);

    return row;
  }

  /**
   * Run every update to keep row values updated
   */
  public update(engine: TEngine, delta: number) {
    if (this.dead) {
      return;
    }

    this.rows = this.rows.filter((r) => !r.dead);

    for (const row of this.rows) {
      row.update(engine, delta);
    }
  }

  /**
   * Remove section from the debug panel
   */
  public remove() {
    this.dead = true;
  }
}
