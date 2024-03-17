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

  public bounds?: { min: vec3; max: vec3 };

  constructor(config?: {
    distance?: number;
    axis?: string;
    deadzone?: number;
    bounds?: { min: vec3; max: vec3 };
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

    if (config?.bounds !== undefined) {
      if (config.bounds.min[0] > config.bounds.max[0]) {
        throw new Error('min x must be less than max x');
      }
      if (config.bounds.min[1] > config.bounds.max[1]) {
        throw new Error('min y must be less than max y');
      }
      if (config.bounds.min[2] > config.bounds.max[2]) {
        throw new Error('min z must be less than max z');
      }

      this.bounds = config.bounds;
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
      vec3.fromValues(this.distance, this.distance, this.distance),
    );

    const target = this.component.getWorldTransform();
    const translation = vec3.add(vec3.create(), target.translation, distance);

    // Calculate the linear distance between the camera's current position and the target position
    const normalisedDistance = vec3.sub(
      vec3.create(),
      camera.cameraComponent.transform.translation,
      distance,
    );
    const linearDistance = vec3.distance(
      normalisedDistance,
      target.translation,
    );

    if (this.bounds) {
      translation[0] = Math.max(
        this.bounds.min[0],
        Math.min(this.bounds.max[0], translation[0]),
      );
      translation[1] = Math.max(
        this.bounds.min[1],
        Math.min(this.bounds.max[1], translation[1]),
      );
      translation[2] = Math.max(
        this.bounds.min[2],
        Math.min(this.bounds.max[2], translation[2]),
      );
    }

    if (linearDistance > this.deadzone) {
      const rotation = quat.fromEuler(
        quat.create(),
        ...this.axisConfig[this.axis].rotation,
      );

      camera.moveTo(translation);
      camera.cameraComponent.transform.rotation = rotation;
    }
  }
}
