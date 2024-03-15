import type { mat4 } from 'gl-matrix';
import type { TCameraView } from './camera-view';
import TPerspectiveCamera from './perspective-camera';

export interface ICamera {
  getView(): TCameraView;
  getProjectionMatrix(width: number, height: number): mat4;
}

export const getDefaultCamera: () => TPerspectiveCamera = () => {
  return new TPerspectiveCamera();
};
