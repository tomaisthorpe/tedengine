import { vec3 } from 'gl-matrix';
import type TSceneComponent from '../actor-components/scene-component';
import type TEngine from '../engine/engine';
import type TBaseCamera from './base-camera';
import type TCameraController from './camera-controller';

export default class TTopDownCameraController implements TCameraController {
  private component?: TSceneComponent;

  // Distance from the attached component on the z axis.
  private distance = 0;

  constructor(config?: { distance?: number }) {
    if (config?.distance !== undefined) {
      this.distance = config.distance;
    }
  }

  attachTo(component: TSceneComponent) {
    this.component = component;
  }

  async onUpdate(camera: TBaseCamera, _: TEngine, __: number): Promise<void> {
    if (!this.component) return;

    const target = this.component.getWorldTransform();

    const translation = vec3.fromValues(
      target.translation[0],
      target.translation[1],
      target.translation[2] - this.distance
    );

    camera.lookAt(translation[0], translation[1], translation[2]);
  }
}
