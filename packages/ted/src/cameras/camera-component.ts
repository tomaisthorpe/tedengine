import { TComponent } from '../core/component';
import type { TProjectionType } from '../graphics';

export interface TPerspectiveCameraConfig {
  type: TProjectionType.Perspective;
  fov?: number;
  zNear?: number;
  zFar?: number;
}

export interface TOrthographicCameraConfig {
  type: TProjectionType.Orthographic;
  zNear?: number;
  zFar?: number;
}

export type TCameraConfig =
  | TPerspectiveCameraConfig
  | TOrthographicCameraConfig;

export class TCameraComponent extends TComponent {
  constructor(public cameraConfig: TCameraConfig) {
    super();
  }
}

export class TActiveCameraComponent extends TComponent {}
