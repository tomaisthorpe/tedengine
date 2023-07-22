import type { IAsset } from '../core/resource-manager';

export interface TGridTile {
  tile: number;
  px: [number, number];
  src: [number, number];
}

export interface TTilemapLayer {
  tileset: number;
  grid: TGridTile[];
}

export interface TTilesetDef {
  tileSize: number;
}

export default class TTilemap implements IAsset {
  public displayWidth = 0;
  public displayHeight = 0;

  public layers: TTilemapLayer[] = [];

  public tilesetDefs: { [key: number]: TTilesetDef } = {};

  public async load(response: Response): Promise<void> {
    const data = await response.json();

    // Get the first level only
    const level = data.levels[0];
    this.displayWidth = level.pxWid;
    this.displayHeight = level.pxHei;

    for (const layerInstance of data.levels[0].layerInstances) {
      const layer: TTilemapLayer = {
        tileset: layerInstance.__tilesetDefUid,
        grid: [],
      };

      for (const gridTile of layerInstance.gridTiles) {
        const { t, px, src } = gridTile;

        layer.grid.push({ tile: t, px, src });
      }

      this.layers.unshift(layer);
    }

    // Get the tileset defs
    for (const tileset of data.defs.tilesets) {
      this.tilesetDefs[tileset.uid] = {
        tileSize: tileset.tileGridSize,
      };
    }
  }
}
