import type TSceneComponent from '../actor-components/scene-component';
import type TEngine from '../engine/engine';
import type TBaseCamera from './base-camera';
import TBaseCameraController from './base-camera-controller';
import type ICameraController from './camera-controller';

export default class TFollowComponentCameraController
  extends TBaseCameraController
  implements ICameraController
{
  private component?: TSceneComponent;

  attachTo(component: TSceneComponent) {
    this.component = component;
  }

  async onUpdate(
    camera: TBaseCamera,
    engine: TEngine,
    delta: number,
  ): Promise<void> {
    await super.onUpdate(camera, engine, delta);

    if (!this.component) return;

    const target = this.component.getWorldTransform();
    this.lookAt(target.translation);
  }
}
