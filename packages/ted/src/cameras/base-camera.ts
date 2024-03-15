import type { vec2 } from 'gl-matrix';
import { mat4, quat, vec3 } from 'gl-matrix';
import TActor, { type TActorWithOnUpdate } from '../core/actor';
import TCameraComponent from './camera-component';
import type TCameraController from './camera-controller';
import type TEngine from '../engine/engine';
import TTransform from '../math/transform';

export default class TBaseCamera extends TActor implements TActorWithOnUpdate {
  public cameraComponent: TCameraComponent;

  public controller?: TCameraController;

  /**
   * The lerp factor used for smooth transitions.
   *
   * It's a value between 0 and 1, where 1 means instant transition (no interpolation),
   * and 0 means no movement at all.
   */
  public lerp = 1;

  private targetTranslation?: vec3;
  private translationDelta = 0;
  private targetRotation?: quat;
  private rotationDelta = 0;

  constructor(private engine: TEngine) {
    super();

    this.cameraComponent = new TCameraComponent(this);
  }

  public async onUpdate(engine: TEngine, delta: number): Promise<void> {
    if (this.targetTranslation) {
      this.translationDelta = Math.min(
        1,
        this.translationDelta + delta * this.lerp,
      );

      this.cameraComponent.transform.translation = vec3.lerp(
        vec3.create(),
        this.cameraComponent.transform.translation,
        this.targetTranslation,
        this.translationDelta,
      );

      if (this.translationDelta >= 1) {
        this.targetTranslation = undefined;
        this.translationDelta = 0;
      }
    }

    if (this.targetRotation) {
      this.rotationDelta = Math.min(1, this.rotationDelta + delta * this.lerp);

      this.cameraComponent.transform.rotation = quat.slerp(
        quat.create(),
        this.cameraComponent.transform.rotation,
        this.targetRotation,
        this.rotationDelta,
      );

      if (this.rotationDelta >= 1) {
        this.targetRotation = undefined;
        this.rotationDelta = 0;
      }
    }

    await this.controller?.onUpdate(this, engine, delta);
  }

  /**
   * Move the camera by a specified amount
   */
  public moveBy(vec: vec3, useLerp = true) {
    this.setTranslation(vec, true, useLerp);
  }

  /**
   * Set the camera to a given position
   */

  public moveTo(position: vec3, useLerp = true) {
    this.setTranslation(position, false, useLerp);
  }

  /**
   * Adjusts the camera's rotation so it is looking towards a given position.
   *
   * @param target - The target position as a vec3
   */
  public lookAt(target: vec3, useLerp = true) {
    if (this.lerp === 1 || !useLerp) {
      this.cameraComponent.transform.lookAt(target);
      return;
    }

    // Create a temporary transform with the same position as the camera
    const tempTransform = new TTransform();
    tempTransform.translation = vec3.clone(
      this.cameraComponent.transform.translation,
    );

    // Use the lookAt method to calculate the target rotation
    tempTransform.lookAt(target);

    // Set the target rotation
    this.targetRotation = quat.clone(tempTransform.rotation);
  }

  /**
   * This method is used to convert a screen space location to a world space location.
   *
   * @param location clip space location
   * @returns world space location
   */
  public clipToWorldSpace(location: vec2): vec3 {
    const projectionMatrix = this.getProjectionMatrix(
      this.engine.renderingSize.width,
      this.engine.renderingSize.height,
    );

    return clipToWorldSpace(projectionMatrix, location);
  }

  /**
   * This should be overridden by the camera implementation
   *
   * @returns returns identity matrix
   */
  public getProjectionMatrix(width: number, height: number): mat4 {
    return mat4.identity(mat4.create());
  }

  private setTranslation(vec: vec3, isRelative: boolean, useLerp = true) {
    if (this.lerp === 1 || !useLerp) {
      this.cameraComponent.transform.translation = isRelative
        ? vec3.add(
            vec3.create(),
            this.cameraComponent.transform.translation,
            vec,
          )
        : vec3.clone(vec);
      this.targetTranslation = undefined;
      this.translationDelta = 0;
    } else {
      this.targetTranslation = isRelative
        ? vec3.add(
            vec3.create(),
            this.cameraComponent.transform.translation,
            vec,
          )
        : vec3.clone(vec);
    }
  }
}

export function clipToWorldSpace(projectionMatrix: mat4, location: vec2): vec3 {
  const invertProj = mat4.invert(mat4.create(), projectionMatrix);

  const worldspace = vec3.transformMat4(
    vec3.create(),
    [location[0], location[1], 0],
    invertProj,
  );

  return vec3.fromValues(worldspace[0], worldspace[1], 0);
}
