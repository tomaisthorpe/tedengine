import { TEngine, TGameState } from '@tedengine/ted';

export class EmptyState extends TGameState {}

export const gameConfig = {
  states: {
    empty: EmptyState,
  },
  defaultState: 'empty',
};

const engine = new TEngine(gameConfig, self.postMessage.bind(self));
onmessage = engine.onMessage;
