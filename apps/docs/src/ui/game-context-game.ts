import { TGameState, TPawn, TController, TEngine } from '@tedengine/ted';
import type { SampleEvent } from './game-context';

class Spacebar extends TPawn {
  private spaceCount = 0;
  constructor(private engine: TEngine) {
    super();

    engine.events.addListener<SampleEvent>('SAMPLE_EVENT', () => {
      console.log('You pressed it!');
    });
  }

  public setupController(controller: TController): void {
    super.setupController(controller);

    controller.bindAction('Space', 'pressed', this.spacePressed.bind(this));

    // Set the default value
    this.engine.updateGameContext({ spaceCount: this.spaceCount });
  }

  private spacePressed() {
    this.spaceCount++;

    this.engine.updateGameContext({ spaceCount: this.spaceCount });
  }
}

class GameState extends TGameState {
  private controller?: TSpacebarController;

  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const spacebar = new Spacebar(engine);
    this.addActor(spacebar);

    this.controller = new TSpacebarController(engine);
    this.controller.possess(spacebar);
  }

  protected onUpdate(engine: TEngine, delta: number): void {
    this.controller?.update();
  }
}

class TSpacebarController extends TController {
  constructor(engine: TEngine) {
    super(engine.events);

    this.addActionFromKeyEvent('Space', 'Space');
  }
}

const config = {
  states: {
    game: GameState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

const engine = new TEngine(config, postMessage.bind(self));
onmessage = engine.onMessage;
