import asteroidTexture from '@assets/asteroid.png';
import tilemap from '@assets/tilemap.ldtk';
import tileset from '@assets/tileset.png';
import { vec3 } from 'gl-matrix';
import type { TResourcePackConfig } from '@tedengine/ted';
import {
  TGameState,
  TActor,
  TResourcePack,
  TTilemapComponent,
  TEngine,
} from '@tedengine/ted';

class Sprite extends TActor {
  private tilemapComponent: TTilemapComponent;
  public static resources: TResourcePackConfig = {
    images: [tileset, asteroidTexture],
    tilemaps: [tilemap],
  };

  constructor(engine: TEngine) {
    super();

    this.tilemapComponent = new TTilemapComponent(engine, this, tilemap, [
      {
        id: 1,
        image: tileset,
      },
      {
        id: 4,
        image: asteroidTexture,
      },
    ]);

    this.rootComponent.transform.scale = vec3.fromValues(0.002, 0.002, 1);
    this.rootComponent.transform.translation = vec3.fromValues(0, 0, -2);
  }

  generate(engine: TEngine) {
    this.tilemapComponent.generate(engine);
  }
}

class SpriteState extends TGameState {
  public async onCreate(engine: TEngine) {
    const rp = new TResourcePack(engine, Sprite.resources);

    await rp.load();

    const tilemap = new Sprite(engine);
    await tilemap.generate(engine);
    this.addActor(tilemap);
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
