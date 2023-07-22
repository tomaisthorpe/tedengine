import type { TDebugPanelSerializedData } from './debug-panel';

export enum TEventTypesDebug {
  Update = 'debug_update',
  Action = 'debug_action',
}

export interface TDebugUpdateEvent {
  type: TEventTypesDebug.Update;
  data: TDebugPanelSerializedData;
}

// @todo figure out how to remove this any
export interface TDebugActionEvent {
  type: TEventTypesDebug.Action;
  subType: string;
  data?: any;
}
