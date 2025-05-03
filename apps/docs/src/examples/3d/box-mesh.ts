import { quat, vec3 } from 'gl-matrix';
import {
  TGameState,
  TMeshComponent,
  TMaterialComponent,
  createBoxMesh,
  TVisibilityComponent,
  TTransformComponent,
  TTransform,
} from '@tedengine/ted';
import { TEngine } from '@tedengine/ted';

class BoxState extends TGameState {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const box = this.world.createEntity();
    const transform = new TTransformComponent(
      new TTransform(
        vec3.fromValues(0, 0, -3),
        quat.fromValues(0.2, -0.2, 0, 1),
      ),
    );
    this.world.addComponent(box, transform);

    const mesh = createBoxMesh(1, 1, 1);
    this.world.addComponent(
      box,
      new TMeshComponent({ source: 'inline', geometry: mesh.geometry }),
    );
    this.world.addComponent(box, new TMaterialComponent(mesh.material));
    this.world.addComponent(box, new TVisibilityComponent());
  }
}

const config = {
  states: {
    game: BoxState,
  },
  defaultState: 'game',
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
