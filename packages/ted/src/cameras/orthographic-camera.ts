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
}
