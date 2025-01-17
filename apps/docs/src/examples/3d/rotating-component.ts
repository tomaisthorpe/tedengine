import { vec3 } from 'gl-matrix';
import {
  TRotatingComponent,
  TBoxComponent,
  TGameState,
  TActor,
  TEngine,
} from '@tedengine/ted';

class Actor extends TActor {
  constructor(engine: TEngine) {
    super();

    const rotating = new TRotatingComponent(engine, this);

    const box = new TBoxComponent(engine, this, 1, 1, 1);
    box.attachTo(rotating);

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

    this.world.config.lighting = {
      ambientLightIntensity: 0.5,
      directionalLight: vec3.fromValues(0, 1, 0),
    };
  }
}

const config = {
  states: {
    game: BoxState,
  },
  defaultState: 'game',
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
