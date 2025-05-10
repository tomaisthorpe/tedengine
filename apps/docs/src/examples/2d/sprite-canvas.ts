import { vec3 } from 'gl-matrix';
import type { TTexture } from '@tedengine/ted';
import {
  TCanvas,
  TGameState,
  TSpriteComponent,
  TTextureFilter,
  TEngine,
  TTransform,
  TTransformComponent,
  TTextureComponent,
  TVisibilityComponent,
  TTransformBundle,
} from '@tedengine/ted';

class CanvasState extends TGameState {
  private texture?: TTexture;

  public async onCreate(engine: TEngine) {
    const canvas = new TCanvas(engine, 100, 100);

    const ctx = canvas.getContext();
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = 'green';
    ctx.fillRect(10, 10, 80, 80);

    this.texture = await canvas.getTexture({ filter: TTextureFilter.Nearest });

    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const entity = this.world.createEntity();
    this.world.addComponents(entity, [
      TTransformBundle.with(
        new TTransformComponent(new TTransform(vec3.fromValues(0, 0, -3))),
      ),
      new TSpriteComponent({
        width: 1,
        height: 1,
      }),
      new TTextureComponent(this.texture!),
      new TVisibilityComponent(),
    ]);
  }
}

const config = {
  states: {
    game: CanvasState,
  },
  defaultState: 'game',
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
