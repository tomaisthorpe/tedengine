import type { TDebugPanelRowSerializedData } from './debug-panel-row';
import { TDebugPanelRow } from './debug-panel-row';
import type { IDebugPanelRow } from './debug-panel-row';

export class TDebugPanelFredValue
  extends TDebugPanelRow
  implements IDebugPanelRow
{
  public type = 'fredValue';

  constructor(
    label: string,
    private value: string,
  ) {
    super(label);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public update(): void {}

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
