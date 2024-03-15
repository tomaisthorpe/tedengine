import type { mat4, vec2, vec3 } from 'gl-matrix';
import type { TCameraView } from './camera-view';
import TPerspectiveCamera from './perspective-camera';
import type TEngine from '../engine/engine';

export interface ICamera {
  getView(): TCameraView;
  getProjectionMatrix(width: number, height: number): mat4;
  clipToWorldSpace(location: vec2): vec3;
}

export function getDefaultCamera(engine: TEngine): TPerspectiveCamera {
  return new TPerspectiveCamera(engine);
}
