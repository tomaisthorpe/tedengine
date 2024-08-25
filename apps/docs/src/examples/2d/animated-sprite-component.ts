import asteroidTexture from '@assets/person.png';
import { vec3 } from 'gl-matrix';
import type { TResourcePackConfig } from '@tedengine/ted';
import {
  TGameState,
  TActor,
  TOriginPoint,
  TResourcePack,
  TEngine,
  TAnimatedSpriteComponent,
  TSpriteLayer,
  TOrthographicCamera,
} from '@tedengine/ted';

class Sprite extends TActor {
  public static resources: TResourcePackConfig = {
    textures: [asteroidTexture],
  };

  constructor(engine: TEngine) {
    super();

    const sprite = new TAnimatedSpriteComponent(
      engine,
      this,
      12,
      24,
      TOriginPoint.Center,
      TSpriteLayer.Foreground_0,
      {
        frameCount: 9,
        frameRate: 10,
      },
    );
    sprite.applyTexture(engine, asteroidTexture);

    this.rootComponent.transform.translation = vec3.fromValues(0, 0, -3);

    const section = engine.debugPanel.addSection('Animation', true);
    section.addButtons('Toggle Animation', {
      label: 'Toggle',
      onClick: () => {
        sprite.toggleAnimation();
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
    const asteroid = new Sprite(engine);
    this.addActor(asteroid);

    const camera = new TOrthographicCamera(engine);
    this.activeCamera = camera;
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
