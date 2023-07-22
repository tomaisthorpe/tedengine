import crystalTexture from '@assets/crystal.png';
import asteroidTexture from '@assets/asteroid.png';
import { vec3 } from 'gl-matrix';
import {
  TGameState,
  TActor,
  TSpriteComponent,
  TOriginPoint,
  TResourcePackConfig,
  TResourcePack,
  TSpriteLayer,
  TEngine,
} from '@tedengine/ted';

class Sprite extends TActor {
  public static resources: TResourcePackConfig = {
    textures: [asteroidTexture, crystalTexture],
  };

  constructor(engine: TEngine) {
    super();

    const box = new TSpriteComponent(
      engine,
      this,
      0.8,
      0.8,
      TOriginPoint.Center,
      TSpriteLayer.Foreground_0
    );
    box.applyTexture(engine, asteroidTexture);

    this.rootComponent.transform.translation = vec3.fromValues(0, 0, -3);

    const crystal = new TSpriteComponent(
      engine,
      this,
      1,
      1,
      TOriginPoint.Center,
      TSpriteLayer.Background_0
    );
    crystal.applyTexture(engine, crystalTexture);

    engine.debugPanel.addButtons('Change Order', {
      label: 'Flip',
      onClick: (button) => {
        if (box.layer === TSpriteLayer.Foreground_0) {
          box.layer = TSpriteLayer.Background_0;
          crystal.layer = TSpriteLayer.Foreground_0;
        } else {
          crystal.layer = TSpriteLayer.Background_0;
          box.layer = TSpriteLayer.Foreground_0;
        }
      },
    });
  }
}

class SpriteState extends TGameState {
  public async onCreate(engine: TEngine) {
    const rp = new TResourcePack(engine, Sprite.resources);

    await rp.load();

    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const sprites = new Sprite(engine);
    this.addActor(sprites);
  }
}

const config = {
  states: {
    game: SpriteState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

const engine = new TEngine(config, postMessage.bind(self));
onmessage = engine.onMessage;
