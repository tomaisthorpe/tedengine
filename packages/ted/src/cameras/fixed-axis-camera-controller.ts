import { vec3, quat } from 'gl-matrix';
import type TSceneComponent from '../actor-components/scene-component';
import type TEngine from '../engine/engine';
import type TBaseCamera from './base-camera';
import type TCameraController from './camera-controller';

export default class TFollowAxisCameraController implements TCameraController {
  private component?: TSceneComponent;

  // Distance from the attached component on the z axis.
  public distance = 0;

  public axis = 'z';

  constructor(config?: { distance?: number; axis?: string }) {
    if (config?.distance !== undefined) {
      this.distance = config.distance;
    }

    if (config?.axis !== undefined) {
      this.axis = config.axis;
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
      target.translation[2]
    );

    switch (this.axis) {
      case 'x':
        translation[0] += this.distance;

        camera.cameraComponent.transform.rotation = quat.fromEuler(
          quat.create(),
          0,
          90,
          0
        );
        break;
      case 'y':
        translation[1] += this.distance;

        camera.cameraComponent.transform.rotation = quat.fromEuler(
          quat.create(),
          -90,
          0,
          0
        );
        break;
      case 'z':
        translation[2] += this.distance;

        camera.cameraComponent.transform.rotation = quat.fromEuler(
          quat.create(),
          0,
          0,
          0
        );
        break;
    }

    camera.moveTo(translation);
  }
}
