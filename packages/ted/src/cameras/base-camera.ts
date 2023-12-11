import { quat, vec3 } from 'gl-matrix';
import TActor, { type TActorWithOnUpdate } from '../core/actor';
import TCameraComponent from './camera-component';
import type TCameraController from './camera-controller';
import type TEngine from '../engine/engine';

export default class TBaseCamera extends TActor implements TActorWithOnUpdate {
  public cameraComponent: TCameraComponent;

  public controller?: TCameraController;

  constructor() {
    super();

    this.cameraComponent = new TCameraComponent(this);
  }

  public async onUpdate(engine: TEngine, delta: number): Promise<void> {
    await this.controller?.onUpdate(this, engine, delta);
  }

  /**
   * Move the camera by a specified amount
   */
  public moveBy(x: number, y: number, z = 0) {
    this.cameraComponent.transform.translation = vec3.add(
      vec3.create(),
      this.cameraComponent.transform.translation,
      vec3.fromValues(x, y, z)
    );
  }

  /**
   * Set the camera to a given position
   */
  public moveTo(x: number, y: number, z = 0) {
    this.cameraComponent.transform.translation = vec3.fromValues(x, y, z);
  }

  /**
   * Adjusts the camera's rotation so it is looking towards a given position.
   *
   * This method calculates the direction from the camera to the target position,
   * then calculates the right and up vectors for the camera based on this direction.
   * Finally, it creates a rotation quaternion from these vectors and sets the camera's rotation to this quaternion.
   *
   * @param x - The x-coordinate of the target position
   * @param y - The y-coordinate of the target position
   * @param z - The z-coordinate of the target position (default is 0)
   */
  public lookAt(x: number, y: number, z = 0) {
    const target = vec3.fromValues(x, y, z);
    const direction = vec3.subtract(
      vec3.create(),
      this.cameraComponent.transform.translation,
      target
    );
    vec3.normalize(direction, direction);

    const up = vec3.fromValues(0, 1, 0);
    const right = vec3.cross(vec3.create(), up, direction);
    vec3.normalize(right, right);

    const newUp = vec3.cross(vec3.create(), direction, right);
    vec3.normalize(newUp, newUp);

    const rotation = quat.fromMat3(quat.create(), [
      right[0],
      right[1],
      right[2],
      newUp[0],
      newUp[1],
      newUp[2],
      direction[0],
      direction[1],
      direction[2],
    ]);

    this.cameraComponent.transform.rotation = rotation;
  }
}
