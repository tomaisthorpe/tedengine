import { vec3 } from 'gl-matrix';
import {
  TGameState,
  TEngine,
  createBoxMesh,
  TMaterialComponent,
  TMeshComponent,
  TVisibilityComponent,
  TTransform,
  TTransformComponent,
  TTransformBundle,
} from '@tedengine/ted';
import { TRotatingSystem, TRotatingComponent } from './shared/rotating';

class BoxState extends TGameState {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    this.world.addSystem(new TRotatingSystem(this.world));

    const entity = this.world.createEntity();
    const mesh = createBoxMesh(1, 1, 1);
    this.world.addComponents(entity, [
      TTransformBundle.with(
        new TTransformComponent(new TTransform(vec3.fromValues(0, 0, -3))),
      ),
      new TRotatingComponent(),
      new TVisibilityComponent(),
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
  rendering: {
    clearColor: { r: 0.2, g: 0.1, b: 0.1, a: 1 },
  },
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
