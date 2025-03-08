import { vec3 } from 'gl-matrix';
import {
  TGameState,
  TEngine,
  TMeshComponent,
  TMaterialComponent,
  TShouldRenderComponent,
  createBoxMesh,
  TTransformComponent,
  TTransform,
} from '@tedengine/ted';
import { TRotatingSystem, TRotatingComponent } from '../shared/rotating';

class BoxState extends TGameState {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    this.world.ecs.addSystem(new TRotatingSystem(this.world.ecs));

    const entity = this.world.ecs.createEntity();
    const mesh = createBoxMesh(1, 1, 1);
    this.world.ecs.addComponents(entity, [
      new TTransformComponent(new TTransform(vec3.fromValues(0, 0, -3))),
      new TRotatingComponent(),
      new TShouldRenderComponent(),
      new TMeshComponent({ source: 'inline', geometry: mesh.geometry }),
      new TMaterialComponent(mesh.material),
    ]);

    this.world.config.lighting = {
      ambientLight: {
        intensity: 0.5,
      },
      directionalLight: {
        direction: vec3.fromValues(0, 1, 0),
        intensity: 1,
      },
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
