import { TGameState, TEngine, TKeyDownEvent } from '@tedengine/ted';
import type { SampleEvent } from './game-context';

class GameState extends TGameState {
  private spaceCount = 0;
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    this.events.addListener<SampleEvent>('SAMPLE_EVENT', () => {
      console.log('You pressed it!');
    });

    this.engine.updateGameContext({ spaceCount: this.spaceCount });

    this.events.addListener<TKeyDownEvent>('keydown', (event) => {
      if (event.subType === 'Space') {
        this.spaceCount++;
        this.engine.updateGameContext({ spaceCount: this.spaceCount });
      }
    });
  }
}

const config = {
  states: {
    game: GameState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
