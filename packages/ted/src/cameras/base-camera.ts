import type { vec2 } from 'gl-matrix';
import { mat4, vec3 } from 'gl-matrix';
import TActor, { type TActorWithOnUpdate } from '../core/actor';
import TCameraComponent from './camera-component';
import type ICameraController from './camera-controller';
import type TEngine from '../engine/engine';

export default class TBaseCamera extends TActor implements TActorWithOnUpdate {
  public cameraComponent: TCameraComponent;

  public controller?: ICameraController;

  constructor(private engine: TEngine) {
    super();

    this.cameraComponent = new TCameraComponent(this);
  }

  public async onUpdate(engine: TEngine, delta: number): Promise<void> {
    await this.controller?.onUpdate(this, engine, delta);
  }

  /**
   * Move the camera by a specified amount
   */
  public moveBy(vec: vec3) {
    this.setTranslation(vec, true);
  }

  /**
   * Set the camera to a given position
   */
  public moveTo(position: vec3) {
    this.setTranslation(position, false);
  }

  /**
   * Adjusts the camera's rotation so it is looking towards a given position.
   *
   * @param target - The target position as a vec3
   */
  public lookAt(target: vec3) {
    this.cameraComponent.transform.lookAt(target);
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

  private setTranslation(vec: vec3, isRelative: boolean) {
    if (isRelative) {
      this.cameraComponent.transform.translation = vec3.add(
        vec3.create(),
        this.cameraComponent.transform.translation,
        vec,
      );
    } else {
      this.cameraComponent.transform.translation = vec3.clone(vec);
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
