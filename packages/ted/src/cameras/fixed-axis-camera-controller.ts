import { vec3, quat } from 'gl-matrix';
import type TSceneComponent from '../actor-components/scene-component';
import type TEngine from '../engine/engine';
import type TBaseCamera from './base-camera';
import type TCameraController from './camera-controller';

export default class TFollowAxisCameraController implements TCameraController {
  private component?: TSceneComponent;

  // Distance from the attached component on the z axis.
  public distance = 0;

  public deadzone = 0;

  public axis = 'z';
  private axisConfig: {
    [key: string]: {
      distance: [number, number, number];
      rotation: [number, number, number];
    };
  } = {
    x: { distance: [1, 0, 0], rotation: [0, 90, 0] },
    y: { distance: [0, 1, 0], rotation: [-90, 0, 0] },
    z: { distance: [0, 0, 1], rotation: [0, 0, 0] },
  };

  constructor(config?: {
    distance?: number;
    axis?: string;
    deadzone?: number;
  }) {
    if (config?.distance !== undefined) {
      this.distance = config.distance;
    }

    if (config?.axis !== undefined) {
      this.axis = config.axis;
    }

    if (config?.deadzone !== undefined) {
      this.deadzone = config.deadzone;
    }
  }

  attachTo(component: TSceneComponent) {
    this.component = component;
  }

  async onUpdate(camera: TBaseCamera, _: TEngine, __: number): Promise<void> {
    if (!this.component || !this.axisConfig[this.axis]) return;

    const distance = vec3.multiply(
      vec3.create(),
      this.axisConfig[this.axis].distance,
      vec3.fromValues(this.distance, this.distance, this.distance)
    );

    const target = this.component.getWorldTransform();
    const translation = vec3.add(vec3.create(), target.translation, distance);

    // Calculate the linear distance between the camera's current position and the target position
    const normalisedDistance = vec3.sub(
      vec3.create(),
      camera.cameraComponent.transform.translation,
      distance
    );
    const linearDistance = vec3.distance(
      normalisedDistance,
      target.translation
    );

    if (linearDistance > this.deadzone) {
      const rotation = quat.fromEuler(
        quat.create(),
        ...this.axisConfig[this.axis].rotation
      );

      camera.moveTo(translation);
      camera.cameraComponent.transform.rotation = rotation;
    }
  }
}
