import { vec3, quat } from 'gl-matrix';
import type TSceneComponent from '../actor-components/scene-component';
import type TEngine from '../engine/engine';
import type ICameraController from './camera-controller';
import TBaseCameraController from './base-camera-controller';
import type TBaseCamera from './base-camera';

export default class TFixedAxisCameraController
  extends TBaseCameraController
  implements ICameraController
{
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

  private lastPosition?: vec3;
  public leadFactor = 0; // Adjustable lead factor
  public maxLead = 0; // Maximum lead distance

  constructor(config?: {
    distance?: number;
    axis?: string;
    deadzone?: number;
    bounds?: { min: vec3; max: vec3 };
    leadFactor?: number;
    maxLead?: number;
    lerpFactor?: number;
  }) {
    super();

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

    if (config?.leadFactor !== undefined) {
      this.leadFactor = config.leadFactor;
    }

    if (config?.maxLead !== undefined) {
      this.maxLead = config.maxLead;
    }

    if (config?.lerpFactor !== undefined) {
      this.lerpFactor = config.lerpFactor;
    }
  }

  /**
   * Attach this controller to a scene component.
   * @param component The scene component to attach to.
   */
  attachTo(component: TSceneComponent): void {
    this.component = component;
  }

  /**
   * Update the camera position based on the target's position and velocity.
   * @param camera The camera to update.
   * @param engine The game engine.
   * @param delta Time delta.
   */
  public async onUpdate(
    camera: TBaseCamera,
    engine: TEngine,
    delta: number,
  ): Promise<void> {
    await super.onUpdate(camera, engine, delta);

    if (!this.component || !this.axisConfig[this.axis]) return;

    const currentPosition = this.component.getWorldTransform().translation;

    // Calculate velocity locally
    const velocity = vec3.create();
    if (this.lastPosition && this.leadFactor > 0) {
      vec3.subtract(velocity, currentPosition, this.lastPosition);
      vec3.scale(velocity, velocity, 1 / delta);
    }
    this.lastPosition = vec3.clone(currentPosition);

    // Calculate lead position with maximum lead
    const leadPosition = vec3.create();
    const leadVector = vec3.create();
    vec3.scale(leadVector, velocity, this.leadFactor);

    // Limit the lead vector to the maximum lead distance
    if (this.maxLead > 0) {
      const leadDistance = vec3.length(leadVector);
      if (leadDistance > this.maxLead) {
        vec3.scale(leadVector, leadVector, this.maxLead / leadDistance);
      }
    }

    vec3.add(leadPosition, currentPosition, leadVector);

    const distance = vec3.multiply(
      vec3.create(),
      this.axisConfig[this.axis].distance,
      vec3.fromValues(this.distance, this.distance, this.distance),
    );

    const targetPosition = vec3.add(vec3.create(), leadPosition, distance);

    // Apply bounds
    if (this.bounds) {
      vec3.max(targetPosition, targetPosition, this.bounds.min);
      vec3.min(targetPosition, targetPosition, this.bounds.max);
    }

    // Apply deadzone
    const currentCameraPosition = camera.cameraComponent.transform.translation;
    const distanceToTarget = vec3.distance(
      currentCameraPosition,
      targetPosition,
    );
    if (distanceToTarget > this.deadzone) {
      this.moveTo(targetPosition);

      const rotation = quat.fromEuler(
        quat.create(),
        ...this.axisConfig[this.axis].rotation,
      );
      camera.cameraComponent.transform.rotation = rotation;
    }
  }
}
