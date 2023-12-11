import type TSceneComponent from '../actor-components/scene-component';
import type TEngine from '../engine/engine';
import type TBaseCamera from './base-camera';
import type TCameraController from './camera-controller';

export default class TFollowComponentCameraController
  implements TCameraController
{
  private component?: TSceneComponent;

  attachTo(component: TSceneComponent) {
    this.component = component;
  }

  async onUpdate(camera: TBaseCamera, _: TEngine, __: number): Promise<void> {
    if (!this.component) return;

    const target = this.component.getWorldTransform();
    camera.lookAt(target.translation);
  }
}
