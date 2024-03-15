import type { TGameStateType } from '../core/game-state-manager';

export interface TConfig {
  states: { [key: string]: TGameStateType };
  defaultState: string;
  debugPanelOpen?: boolean;
}
