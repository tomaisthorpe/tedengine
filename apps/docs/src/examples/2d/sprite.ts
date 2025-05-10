import asteroidTexture from '@assets/asteroid.png';
import { vec3 } from 'gl-matrix';
import type { TTexture } from '@tedengine/ted';
import {
  TGameState,
  TSpriteComponent,
  TOriginPoint,
  TResourcePack,
  TEngine,
  TTextureComponent,
  TTransform,
  TTransformComponent,
  TVisibilityComponent,
  TTransformBundle,
} from '@tedengine/ted';

class SpriteState extends TGameState {
  public async onCreate(engine: TEngine) {
    const rp = new TResourcePack(engine, {
      textures: [asteroidTexture],
    });

    await rp.load();

    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const entity = this.world.createEntity([
      TTransformBundle.with(
        new TTransformComponent(new TTransform(vec3.fromValues(0, 0, -3))),
      ),
      new TSpriteComponent({
        width: 1,
        height: 1,
        origin: TOriginPoint.Center,
      }),
      new TTextureComponent(engine.resources.get<TTexture>(asteroidTexture)!),
      new TVisibilityComponent(),
    ]);

    const section = engine.debugPanel.addSection('Color Filter', true);
    section.addInput(
      'Red',
      'range',
      '1',
      (value) => {
        entity.components[TSpriteComponent].colorFilter[0] = parseFloat(value);
      },
      {
        min: 0,
        max: 1,
        step: 0.01,
      },
    );
    section.addInput(
      'Green',
      'range',
      '1',
      (value) => {
        entity.components[TSpriteComponent].colorFilter[1] = parseFloat(value);
      },
      {
        min: 0,
        max: 1,
        step: 0.01,
      },
    );
    section.addInput(
      'Blue',
      'range',
      '1',
      (value) => {
        entity.components[TSpriteComponent].colorFilter[2] = parseFloat(value);
      },
      {
        min: 0,
        max: 1,
        step: 0.01,
      },
    );
    section.addInput(
      'Alpha',
      'range',
      '1',
      (value) => {
        entity.components[TSpriteComponent].colorFilter[3] = parseFloat(value);
      },
      {
        min: 0,
        max: 1,
        step: 0.01,
      },
    );
  }
}

const config = {
  states: {
    game: SpriteState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
