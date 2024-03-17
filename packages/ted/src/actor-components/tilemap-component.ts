import type TActor from '../core/actor';
import type TEngine from '../engine/engine';
import TCanvas from '../graphics/canvas';
import TImage from '../graphics/image';
import TTilemap from '../graphics/tilemap';
import type { TPhysicsBodyOptions } from '../physics/physics-world';
import TSpriteComponent from './sprite-component';

export interface TTileset {
  id: number;
  image: TImage;
  tileSize: number;
}

export interface TTilesetConfig {
  id: number;
  image: string | TImage;
}

export default class TTilemapComponent extends TSpriteComponent {
  public tilemap: TTilemap = new TTilemap();
  public tilesets: { [key: number]: TTileset } = {};

  constructor(
    engine: TEngine,
    actor: TActor,
    tilemapPath: string | TTilemap,
    tilesets: TTilesetConfig[],
    bodyOptions?: TPhysicsBodyOptions,
  ) {
    super(engine, actor, 1, 1);

    this.setTilemap(engine, tilemapPath);

    this.tilesets = tilesets.reduce(
      (result, tileset) =>
        Object.assign({}, result, {
          [tileset.id]: this.getTileset(engine, tileset),
        }),
      {},
    );

    this.width = this.tilemap.displayWidth;
    this.height = this.tilemap.displayHeight;

    this.shouldRender = false;
  }

  /**
   * Assigns a given tileset to this component.
   *
   * @param {TEngine} engine
   * @param {string} tileset path
   */
  private getTileset(engine: TEngine, tileset: TTilesetConfig): TTileset {
    let image: TImage;
    if (tileset.image instanceof TImage) {
      image = tileset.image as TImage;
    } else {
      image = engine.resources.get<TImage>(tileset.image as string);
    }

    // Get the tileset from the tilemap defs
    const tilesetDef = this.tilemap.tilesetDefs[tileset.id];

    return {
      id: tileset.id,
      image,
      tileSize: tilesetDef.tileSize,
    };
  }

  /**
   * Assigns a given tilemap to this component.
   *
   * @param {TEngine} engine
   * @param {string} tilemap path
   */
  private setTilemap(engine: TEngine, tilemapPath: string | TTilemap) {
    if (tilemapPath instanceof TTilemap) {
      this.tilemap = tilemapPath as TTilemap;
    } else {
      this.tilemap = engine.resources.get<TTilemap>(tilemapPath as string);
    }
  }

  public async generate(engine: TEngine) {
    const canvas = new TCanvas(engine, this.width, this.height);

    const ctx = canvas.getContext();

    for (const layer of this.tilemap.layers) {
      const tileset = this.tilesets[layer.tileset];
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

    this.texture = await canvas.getTexture();

    this.generateMesh();

    this.shouldRender = true;
  }
}
