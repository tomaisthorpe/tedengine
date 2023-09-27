import type TEngine from '../engine/engine';
import type { TDebugPanelRowSerializedData } from './debug-panel-row';
import TDebugPanelRow from './debug-panel-row';
import type { IDebugPanelRow } from './debug-panel-row';

export type TUpdateFunction = (engine: TEngine, delta: number) => string;

export default class TDebugPanelValue
  extends TDebugPanelRow
  implements IDebugPanelRow
{
  public type = 'value';
  public value = '';

  constructor(
    label: string,
    private updateFunction: TUpdateFunction,
    private indentLevel: number
  ) {
    super(label);
  }

  /**
   * Run every update and updates the debug value
   */
  public update(engine: TEngine, delta: number) {
    this.value = this.updateFunction(engine, delta);
  }

  public getData(): TDebugPanelRowSerializedData {
    return {
      ...this.getBaseData(),
      type: this.type,
      data: {
        value: this.value,
        indentLevel: this.indentLevel,
      },
    };
  }
}
