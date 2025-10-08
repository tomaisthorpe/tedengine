import type { TGameStateType } from '../core/game-state-manager';
import type { TTextureOptions } from '../renderer/renderable-texture';

export interface TConfig {
  states: { [key: string]: TGameStateType };
  defaultState: string;
  debugPanelOpen?: boolean;
  defaultTextureOptions?: TTextureOptions;
}
