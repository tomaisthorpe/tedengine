import { TComponent } from '../core/component';
import type { IMaterial } from '../graphics/material';
import type { TPaletteIndex } from '../renderer/renderable-mesh';

export interface TMeshGeometry {
  positions: number[];
  normals: number[];
  indexes: number[];
  colors?: number[];
  paletteIndex?: TPaletteIndex;
  uvs?: number[];
}

export interface TInlineMeshData {
  source: 'inline';
  geometry: TMeshGeometry;
}

export interface TAssetMeshData {
  source: 'path';
  path: string;
}

export class TMeshComponent extends TComponent {
  public uuid?: string;

  constructor(public data: TInlineMeshData | TAssetMeshData) {
    super();
  }
}

export class TMaterialComponent extends TComponent {
  constructor(public material: IMaterial) {
    super();
  }
}
