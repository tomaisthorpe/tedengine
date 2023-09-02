import { vec3 } from 'gl-matrix';
import { TBoxComponent, TGameState, TActor } from '@tedengine/ted';
import { TEngine } from '@tedengine/ted';

class Actor extends TActor {
  constructor(engine: TEngine) {
    super();

    const box = new TBoxComponent(engine, this, 1, 1, 1);

    this.rootComponent.transform.translation = vec3.fromValues(0, 0, -3);
  }
}

class BoxState extends TGameState {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const box = new Actor(engine);
    this.addActor(box);
  }
}

const config = {
  states: {
    game: BoxState,
  },
  defaultState: 'game',
};

new TEngine(config, postMessage.bind(self));
