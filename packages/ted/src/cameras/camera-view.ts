import type { mat4 } from 'gl-matrix';
import type { TProjectionType } from '../graphics';

export interface TCameraView {
  projectionType: TProjectionType;
  fov?: number;
  transform: mat4;
}
