import type { vec4, vec2 } from 'gl-matrix';
import type TTexture from '../graphics/texture';
import { TComponent } from '../core/component';

export interface TTexturedMeshGeometry {
  positions: number[];
  normals: number[];
  indexes: number[];
  uvs: number[];
}

export interface TInlineTexturedMeshData {
  source: 'inline';
  geometry: TTexturedMeshGeometry;
}

export interface TAssetTexturedMeshData {
  source: 'path';
  path: string;
}

export class TTextureComponent extends TComponent {
  constructor(
    public texture: TTexture,
    public colorFilter?: vec4,
    public instanceUVScales?: vec2,
  ) {
    super();
  }
}

export default class TTexturedMeshComponent extends TComponent {
  public uuid?: string;

  constructor(public data: TInlineTexturedMeshData | TAssetTexturedMeshData) {
    super();
  }
}
