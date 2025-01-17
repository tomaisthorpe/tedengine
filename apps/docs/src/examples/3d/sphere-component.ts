import { vec3 } from 'gl-matrix';
import {
  TSphereComponent,
  TGameState,
  TActor,
  TOrbitCamera,
  TEngine,
} from '@tedengine/ted';

class Actor extends TActor {
  constructor(engine: TEngine) {
    super();

    new TSphereComponent(engine, this, 0.5, 12, 12);

    this.rootComponent.transform.translation = vec3.fromValues(0, 0, 0);
  }
}

class SphereState extends TGameState {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const box = new Actor(engine);
    this.addActor(box);

    const orbitCamera = new TOrbitCamera(engine, 5);
    this.addActor(orbitCamera);

    this.activeCamera = orbitCamera;

    this.world.config.lighting = {
      ambientLightIntensity: 0.1,
      directionalLight: vec3.fromValues(-0.5, 0.7, 0.2),
    };
  }
}

const config = {
  states: {
    game: SphereState,
  },
  defaultState: 'game',
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
