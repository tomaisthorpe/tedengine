import type { vec2, vec4 } from 'gl-matrix';
import { TComponent } from '../core/component';
import type { TTexture } from '../graphics/texture';

export class TTextureComponent extends TComponent {
  constructor(
    public texture: TTexture,
    public colorFilter?: vec4,
    public instanceUVScales?: vec2,
  ) {
    super();
  }
}
