import asteroidTexture from '@assets/asteroid.png';
import tilemap from '@assets/tilemap.ldtk';
import tileset from '@assets/tileset.png';
import { vec3 } from 'gl-matrix';
import type { TImage, TTilemap } from '@tedengine/ted';
import {
  TGameState,
  TResourcePack,
  TTilemapComponent,
  TEngine,
  TShouldRenderComponent,
  TTransform,
  TTransformComponent,
  TTilemapSystem,
} from '@tedengine/ted';

class SpriteState extends TGameState {
  public async onCreate(engine: TEngine) {
    this.world.ecs.addSystem(new TTilemapSystem(this.world.ecs));

    const rp = new TResourcePack(engine, {
      images: [tileset, asteroidTexture],
      tilemaps: [tilemap],
    });

    await rp.load();

    const entity = this.world.ecs.createEntity();
    this.world.ecs.addComponents(entity, [
      new TTilemapComponent(engine.resources.get<TTilemap>(tilemap)!, [
        {
          id: 1,
          image: engine.resources.get<TImage>(tileset)!,
        },
        {
          id: 4,
          image: engine.resources.get<TImage>(asteroidTexture)!,
        },
      ]),
      new TTransformComponent(
        new TTransform(
          vec3.fromValues(0, 0, -2),
          undefined,
          vec3.fromValues(0.002, 0.002, 1),
        ),
      ),
      new TShouldRenderComponent(),
    ]);
  }
}

const config = {
  states: {
    game: SpriteState,
  },
  defaultState: 'game',
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
