import asteroidTexture from '@assets/asteroid.png';
import { vec3, vec4 } from 'gl-matrix';
import type { TResourcePackConfig } from '@tedengine/ted';
import {
  TGameState,
  TActor,
  TSpriteComponent,
  TOriginPoint,
  TResourcePack,
  TEngine,
} from '@tedengine/ted';

class Sprite extends TActor {
  public static resources: TResourcePackConfig = {
    textures: [asteroidTexture],
  };

  constructor(engine: TEngine) {
    super();

    const box = new TSpriteComponent(engine, this, 1, 1, TOriginPoint.Center);
    box.applyTexture(engine, asteroidTexture);
    box.colorFilter = vec4.fromValues(1, 1, 1, 1);

    const section = engine.debugPanel.addSection('Color Filter', true);
    section.addInput(
      'Red',
      'range',
      '1',
      (value) => {
        box.colorFilter[0] = parseFloat(value);
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
        box.colorFilter[1] = parseFloat(value);
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
        box.colorFilter[2] = parseFloat(value);
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
        box.colorFilter[3] = parseFloat(value);
      },
      {
        min: 0,
        max: 1,
        step: 0.01,
      },
    );

    this.rootComponent.transform.translation = vec3.fromValues(0, 0, -3);
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
