import { TEngine, TGameState } from '@tedengine/ted';

export class EmptyState extends TGameState {}

export const gameConfig = {
  states: {
    empty: EmptyState,
  },
  defaultState: 'empty',
};

new TEngine(gameConfig, self as DedicatedWorkerGlobalScope);
