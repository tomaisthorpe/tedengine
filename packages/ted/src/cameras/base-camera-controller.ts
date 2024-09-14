import { vec3, quat } from 'gl-matrix';
import type TEngine from '../engine/engine';
import type TBaseCamera from './base-camera';
import TTransform from '../math/transform';

/**
 * Base class for all camera controllers.
 * Handles movement and rotation with linear interpolation (lerp) using delta time.
 */
export default class TBaseCameraController {
  /**
   * Lerp factor controlling the speed of interpolation.
   * - If set to 1, movement and rotation are applied immediately.
   * - Values closer to 1 result in faster transitions.
   * - Values closer to 0 result in slower transitions.
   */
  public lerpFactor = 1;

  private targetPosition?: vec3;
  private targetLookAt?: vec3;
  private instantMove = false;
  private instantLookAt = false;

  /**
   * Move the camera to the specified position using linear interpolation.
   * @param position The target position to move the camera to.
   * @param instant If true, move the camera instantly without interpolation.
   */
  public moveTo(position: vec3, instant = false) {
    this.targetPosition = vec3.clone(position);
    this.instantMove = instant;
  }

  /**
   * Adjust the camera to look at the specified target position using linear interpolation.
   * @param target The target position to look at.
   * @param instant If true, rotate the camera instantly without interpolation.
   */
  public lookAt(target: vec3, instant = false) {
    this.targetLookAt = vec3.clone(target);
    this.instantLookAt = instant;
  }

  /**
   * Update method to apply lerp to the camera's position and rotation towards targets.
   * Utilizes delta time to ensure consistent interpolation speed.
   * @param camera The camera to control.
   * @param engine The engine instance.
   * @param delta Time delta in milliseconds since the last update.
   */
  public async onUpdate(
    camera: TBaseCamera,
    engine: TEngine,
    delta: number,
  ): Promise<void> {
    const t = 1 - Math.pow(1 - this.lerpFactor, delta * 10);

    const currentPosition =
      camera.cameraComponent.getWorldTransform().translation;

    if (this.targetPosition) {
      if (this.instantMove || this.lerpFactor >= 1) {
        camera.cameraComponent.transform.translation = vec3.clone(
          this.targetPosition,
        );
        this.targetPosition = undefined;
        this.instantMove = false;
      } else {
        camera.cameraComponent.transform.translation = this.lerpVector(
          currentPosition,
          this.targetPosition,
          t,
        );

        if (vec3.distance(currentPosition, this.targetPosition) < 0.001) {
          this.targetPosition = undefined;
        }
      }
    }

    if (this.targetLookAt) {
      const tempTransform = new TTransform();
      tempTransform.translation = vec3.clone(currentPosition);
      tempTransform.lookAt(this.targetLookAt);

      const desiredQuat = tempTransform.rotation;

      if (this.instantLookAt || this.lerpFactor >= 1) {
        camera.cameraComponent.transform.rotation = quat.clone(
          tempTransform.rotation,
        );
        this.targetLookAt = undefined;
        this.instantLookAt = false;
      } else {
        camera.cameraComponent.transform.rotation = this.lerpQuaternion(
          camera.cameraComponent.transform.rotation,
          desiredQuat,
          t,
        );

        const angle = quat.getAngle(
          camera.cameraComponent.transform.rotation,
          desiredQuat,
        );
        if (angle < 0.001) {
          this.targetLookAt = undefined;
        }
      }
    }
  }

  /**
   * Linearly interpolate between two vectors using a dynamic factor.
   * @param current Current vector.
   * @param target Target vector.
   * @param t Dynamic lerp factor based on delta time.
   * @returns Interpolated vector.
   */
  private lerpVector(current: vec3, target: vec3, t: number): vec3 {
    return vec3.lerp(vec3.create(), current, target, t);
  }

  /**
   * Spherically interpolate between two quaternions using a dynamic factor.
   * @param current Current quaternion.
   * @param target Target quaternion.
   * @param t Dynamic lerp factor based on delta time.
   * @returns Interpolated quaternion.
   */
  private lerpQuaternion(current: quat, target: quat, t: number): quat {
    return quat.slerp(quat.create(), current, target, t);
  }
}
