import type TGameState from '../core/game-state';

export interface TConfig {
  states: { [key: string]: { new (): TGameState } };
  defaultState: string;
  debugPanelOpen?: boolean;
}
