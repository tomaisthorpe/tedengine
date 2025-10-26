import { v4 as uuid } from 'uuid';
import type { TEngine } from '../engine/engine';
import type { TDebugInputProps } from './debug-panel-input';
import type { TDebugSelectOption } from './debug-panel-select';
import type { vec3 } from 'gl-matrix';

export interface IDebugPanelRow {
  uuid: string;
  type: string;
  dead: boolean;
  label: string;
  children: IDebugPanelRow[];
  update: (engine: TEngine, delta: number) => void;
  getData: () => TDebugPanelRowSerializedData;
  remove: () => void;
}

export interface TDebugPanelRowSerializedData {
  uuid: string;
  label: string;
  type: string;
  data: {
    value?: string | boolean | vec3;
    buttons?: Array<{ label: string; uuid: string }>;
    inputType?: string;
    inputProps?: TDebugInputProps;
    options?: TDebugSelectOption[];
  };
  children?: TDebugPanelRowSerializedData[];
  hasChildren?: boolean;
}

export class TDebugPanelRow {
  public uuid: string;
  public dead = false;
  public children: IDebugPanelRow[] = [];

  constructor(public label: string) {
    this.uuid = uuid();
  }

  /**
   * Add a child row to this row
   */
  public addChild(row: IDebugPanelRow): void {
    this.children.push(row);
  }

  /**
   * Remove row from the debug panel
   */
  public remove() {
    this.dead = true;
    // Also mark children as dead
    for (const child of this.children) {
      child.remove();
    }
  }

  protected getBaseData() {
    return {
      uuid: this.uuid,
      label: this.label,
      children: this.children.map((child) => child.getData()),
      hasChildren: this.children.length > 0,
    };
  }
}
