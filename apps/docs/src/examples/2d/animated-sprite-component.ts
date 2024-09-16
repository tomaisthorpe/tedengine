import asteroidTexture from '@assets/person.png';
import { vec3, vec4 } from 'gl-matrix';
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
  TTextureFilter,
} from '@tedengine/ted';

class Sprite extends TActor {
  public static resources: TResourcePackConfig = {
    textures: [
      {
        url: asteroidTexture,
        config: {
          filter: TTextureFilter.Nearest,
        },
      },
    ],
  };

  constructor(engine: TEngine) {
    super();

    const sprite = new TAnimatedSpriteComponent(
      engine,
      this,
      12 * 4,
      24 * 4,
      TOriginPoint.Center,
      TSpriteLayer.Foreground_0,
      {
        frameCount: 9,
        frameRate: 10,
      },
    );
    sprite.applyTexture(engine, asteroidTexture);
    sprite.colorFilter = vec4.fromValues(0, 0, 0, 0.5);

    const filterSection = engine.debugPanel.addSection('Color Filter', true);
    filterSection.addInput(
      'Red',
      'range',
      '1',
      (value) => {
        sprite.colorFilter[0] = parseFloat(value);
      },
      {
        min: 0,
        max: 1,
        step: 0.01,
      },
    );
    filterSection.addInput(
      'Green',
      'range',
      '1',
      (value) => {
        sprite.colorFilter[1] = parseFloat(value);
      },
      {
        min: 0,
        max: 1,
        step: 0.01,
      },
    );
    filterSection.addInput(
      'Blue',
      'range',
      '1',
      (value) => {
        sprite.colorFilter[2] = parseFloat(value);
      },
      {
        min: 0,
        max: 1,
        step: 0.01,
      },
    );
    filterSection.addInput(
      'Alpha',
      'range',
      '1',
      (value) => {
        sprite.colorFilter[3] = parseFloat(value);
      },
      {
        min: 0,
        max: 1,
        step: 0.01,
      },
    );

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
