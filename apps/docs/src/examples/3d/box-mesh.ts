import { quat, vec3 } from 'gl-matrix';
import {
  TGameState,
  TMeshComponent,
  TMaterialComponent,
  createBoxMesh,
  TVisibilityComponent,
  TTransformComponent,
  TTransform,
  TTransformBundle,
} from '@tedengine/ted';
import { TEngine } from '@tedengine/ted';

class BoxState extends TGameState {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const box = createBoxMesh(1, 1, 1);
    this.world.createEntity([
      TTransformBundle,
      new TTransformComponent(
        new TTransform(
          vec3.fromValues(0, 0, -3),
          quat.fromValues(0.2, -0.2, 0, 1),
        ),
      ),
      new TMeshComponent({ source: 'inline', geometry: box.geometry }),
      new TMaterialComponent(box.material),
      new TVisibilityComponent(),
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
