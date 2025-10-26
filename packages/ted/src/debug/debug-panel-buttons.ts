import { v4 as uuid } from 'uuid';
import type { TEventQueue } from '../core/event-queue';
import type { TEngine } from '../engine/engine';
import type { TDebugPanelRowSerializedData } from './debug-panel-row';
import { TDebugPanelRow } from './debug-panel-row';
import type { IDebugPanelRow } from './debug-panel-row';
import type { TDebugActionEvent } from './events';
import { TEventTypesDebug } from './events';

export interface TButton {
  label: string;
  onClick: (button: TButton) => void;
}

type TButtonWithCallback = TButton & {
  uuid: string;
};

export class TDebugPanelButtons
  extends TDebugPanelRow
  implements IDebugPanelRow
{
  public readonly type = 'buttons';
  private buttons: TButtonWithCallback[];

  constructor(
    private events: TEventQueue,
    label: string,
    ...buttons: TButton[]
  ) {
    super(label);

    this.buttons = buttons.map((button) => ({ ...button, uuid: uuid() }));

    // Register events for each button
    for (const button of this.buttons) {
      this.events.addListener<TDebugActionEvent>(
        TEventTypesDebug.Action,
        button.uuid,
        this.getActionHandler(button.uuid),
      );
    }
  }

  private getActionHandler(uuid: string) {
    return (e: TDebugActionEvent) => {
      const button = this.buttons.filter((button) => button.uuid === uuid);
      if (button.length > 0) {
        button[0].onClick(button[0]);
      }
    };
  }

  public update(engine: TEngine, delta: number) {
    return;
  }

  public getData(): TDebugPanelRowSerializedData {
    return {
      ...this.getBaseData(),
      type: this.type,
      data: {
        buttons: this.buttons.map((button) => ({
          label: button.label,
          uuid: button.uuid,
        })),
      },
    };
  }
}
