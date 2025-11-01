import { TComponent } from '../core/component';
import type { TWorld } from '../core/world';
import { TTransformComponent } from '.';
import type { TEntityQuery } from '../core/entity-query';
import { TSystem, TSystemPriority } from '../core/system';
import type { TEngine } from '../engine/engine';
import { TCanvas } from '../graphics/canvas';
import type { TImage } from '../graphics/image';
import type { TTilemap } from '../graphics/tilemap';
import { TTextureComponent } from './textured-mesh-component';
import { TSpriteComponent } from './sprite-component';

export interface TTileset {
  id: number;
  image: TImage;
  tileSize: number;
}

export interface TTilesetConfig {
  id: number;
  image: TImage;
}

export class TTilemapComponent extends TComponent {
  public tilesets: { [key: number]: TTileset } = {};

  constructor(
    public tilemap: TTilemap,
    tilesets: TTilesetConfig[],
  ) {
    super();

    this.tilemap = tilemap;

    this.tilesets = tilesets.reduce(
      (result, tileset) =>
        Object.assign({}, result, {
          [tileset.id]: this.getTileset(tileset),
        }),
      {},
    );
  }

  private getTileset(tileset: TTilesetConfig): TTileset {
    // Get the tileset from the tilemap defs
    const tilesetDef = this.tilemap.tilesetDefs[tileset.id];

    return {
      id: tileset.id,
      image: tileset.image,
      tileSize: tilesetDef.tileSize,
    };
  }
}

export class TTilemapSystem extends TSystem {
  public static readonly systemName: string = 'TTilemapSystem';
  public readonly priority: number = TSystemPriority.Update;

  private query: TEntityQuery;

  constructor(private world: TWorld) {
    super();

    this.query = world.createQuery([TTilemapComponent, TTransformComponent]);
  }

  public async update(
    engine: TEngine,
    world: TWorld,
    delta: number,
  ): Promise<void> {
    const entities = this.query.execute();

    for (const entity of entities) {
      const tilemap = world.getComponents(entity)?.get(TTilemapComponent);
      if (!tilemap) {
        continue;
      }

      // If entity has a texture, then we've already generated it
      if (world.getComponents(entity)?.has(TTextureComponent)) {
        continue;
      }

      const canvas = new TCanvas(
        engine,
        tilemap.tilemap.displayWidth,
        tilemap.tilemap.displayHeight,
      );

      const ctx = canvas.getContext();

      for (const layer of tilemap.tilemap.layers) {
        const tileset = tilemap.tilesets[layer.tileset];
        const image = tileset.image.image;
        if (!image) {
          continue;
        }

        for (const gridTile of layer.grid) {
          ctx.drawImage(
            image,
            gridTile.src[0],
            gridTile.src[1],
            tileset.tileSize,
            tileset.tileSize,
            gridTile.px[0],
            gridTile.px[1],
            tileset.tileSize,
            tileset.tileSize,
          );
        }
      }

      const texture = await canvas.getTexture();
      world.addComponents(entity, [
        new TTextureComponent(texture),
        new TSpriteComponent({
          width: tilemap.tilemap.displayWidth,
          height: tilemap.tilemap.displayHeight,
        }),
      ]);
    }
  }
}
