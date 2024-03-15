import { mat4 } from 'gl-matrix';
import { TProjectionType } from '../graphics';
import TBaseCamera from './base-camera';
import type { ICamera } from './camera';
import type { TCameraView } from './camera-view';

export default class TOrthographicCamera
  extends TBaseCamera
  implements ICamera
{
  public getView(): TCameraView {
    return {
      projectionType: TProjectionType.Orthographic,
      transform: this.cameraComponent.getWorldTransform().getMatrix(),
    };
  }

  public getProjectionMatrix(width: number, height: number): mat4 {
    const zNear = 0.1;
    const zFar = 100.0;
    const projection = mat4.create();

    mat4.ortho(
      projection,
      -width / 2,
      width / 2,
      -height / 2,
      height / 2,
      zNear,
      zFar,
    );

    const cameraSpace = mat4.invert(
      mat4.create(),
      this.cameraComponent.getWorldTransform().getMatrix(),
    );

    return mat4.multiply(mat4.create(), projection, cameraSpace);
  }
}
