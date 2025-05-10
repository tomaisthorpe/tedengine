import crystalTexture from '@assets/crystal.png';
import asteroidTexture from '@assets/asteroid.png';
import { vec3 } from 'gl-matrix';
import type { TTexture } from '@tedengine/ted';
import {
  TGameState,
  TSpriteComponent,
  TOriginPoint,
  TResourcePack,
  TSpriteLayer,
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
      textures: [asteroidTexture, crystalTexture],
    });

    await rp.load();

    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const asteroidSprite = new TSpriteComponent({
      width: 0.8,
      height: 0.8,
      origin: TOriginPoint.Center,
      layer: TSpriteLayer.Foreground_0,
    });

    this.world.createEntity([
      TTransformBundle,
      new TTransformComponent(new TTransform(vec3.fromValues(0, 0, -3))),
      asteroidSprite,
      new TTextureComponent(engine.resources.get<TTexture>(asteroidTexture)!),
      new TVisibilityComponent(),
    ]);

    const crystalSprite = new TSpriteComponent({
      width: 1,
      height: 1,
      origin: TOriginPoint.Center,
      layer: TSpriteLayer.Background_0,
    });

    this.world.createEntity([
      TTransformBundle,
      new TTransformComponent(new TTransform(vec3.fromValues(0, 0, -3))),
      crystalSprite,
      new TTextureComponent(engine.resources.get<TTexture>(crystalTexture)!),
      new TVisibilityComponent(),
    ]);

    engine.debugPanel.addButtons('Change Order', {
      label: 'Flip',
      onClick: (button) => {
        if (asteroidSprite.layer === TSpriteLayer.Foreground_0) {
          asteroidSprite.layer = TSpriteLayer.Background_0;
          crystalSprite.layer = TSpriteLayer.Foreground_0;
        } else {
          crystalSprite.layer = TSpriteLayer.Background_0;
          asteroidSprite.layer = TSpriteLayer.Foreground_0;
        }
      },
    });
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
