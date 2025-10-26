import type { TDebugPanelSerializedData } from './debug-panel';

export enum TEventTypesDebug {
  Update = 'debug_update',
  Action = 'debug_action',
}

export interface TDebugUpdateEvent {
  type: TEventTypesDebug.Update;
  data: TDebugPanelSerializedData;
}

export interface TDebugActionEvent<T = unknown> {
  type: TEventTypesDebug.Action;
  subType: string;
  data: T;
}
