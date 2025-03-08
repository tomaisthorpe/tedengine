import { vec3 } from 'gl-matrix';
import {
  TGameState,
  TEngine,
  createBoxMesh,
  TMaterialComponent,
  TMeshComponent,
  TShouldRenderComponent,
  TTransform,
  TTransformComponent,
} from '@tedengine/ted';
import { TRotatingSystem, TRotatingComponent } from './shared/rotating';

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
  }
}

const config = {
  states: {
    game: BoxState,
  },
  defaultState: 'game',
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
