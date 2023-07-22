import { TProjectionType } from '../graphics';
import TBaseCamera from './base-camera';
import type { ICamera } from './camera';
import type { TCameraView } from './camera-view';

export default class TPerspectiveCamera extends TBaseCamera implements ICamera {
  public fov = 45;

  public getView(): TCameraView {
    return {
      projectionType: TProjectionType.Perspective,
      transform: this.cameraComponent.getWorldTransform().getMatrix(),
      fov: this.fov,
    };
  }
}
