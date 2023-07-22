import type { mat4 } from 'gl-matrix';
import { TProjectionType } from '../graphics';
import TTransform from '../math/transform';

export interface TCameraView {
  projectionType: TProjectionType;
  fov?: number;
  transform: mat4;
}

export const getDefaultCameraView: () => TCameraView = () => {
  return {
    projectionType: TProjectionType.Perspective,
    fov: 45,
    transform: new TTransform().getMatrix(),
  };
};
