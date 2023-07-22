import asteroidTexture from '@assets/asteroid.png';
import { vec3 } from 'gl-matrix';
import {
  TGameState,
  TActor,
  TSpriteComponent,
  TOriginPoint,
  TResourcePackConfig,
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
};

const engine = new TEngine(config, postMessage.bind(self));
onmessage = engine.onMessage;
