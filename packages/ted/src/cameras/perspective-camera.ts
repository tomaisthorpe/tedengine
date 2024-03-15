import { mat4 } from 'gl-matrix';
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

  public getProjectionMatrix(width: number, height: number): mat4 {
    const fieldOfView = (this.fov * Math.PI) / 180;
    const aspect = width / height;
    const zNear = 0.1;
    const zFar = 100.0;
    const projection = mat4.create();

    mat4.perspective(projection, fieldOfView, aspect, zNear, zFar);

    const cameraSpace = mat4.invert(
      mat4.create(),
      this.cameraComponent.getWorldTransform().getMatrix(),
    );
    return mat4.multiply(mat4.create(), projection, cameraSpace);
  }
}
