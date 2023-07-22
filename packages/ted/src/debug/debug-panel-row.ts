import { v4 as uuid } from 'uuid';
import type TEngine from '../engine/engine';

export interface IDebugPanelRow {
  uuid: string;
  type: string;
  dead: boolean;
  label: string;
  update: (engine: TEngine, delta: number) => void;
  getData: () => TDebugPanelRowSerializedData;
}

export interface TDebugPanelRowSerializedData {
  uuid: string;
  label: string;
  type: string;
  data: any;
}

export default class TDebugPanelRow {
  public uuid: string;
  public dead = false;

  constructor(public label: string) {
    this.uuid = uuid();
  }

  /**
   * Remove row from the debug panel
   */
  public remove() {
    this.dead = true;
  }

  protected getBaseData() {
    return {
      uuid: this.uuid,
      label: this.label,
    };
  }
}
