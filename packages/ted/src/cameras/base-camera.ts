import { vec3 } from 'gl-matrix';
import TActor from '../core/actor';
import TCameraComponent from './camera-component';

export default class TBaseCamera extends TActor {
  public cameraComponent: TCameraComponent;

  constructor() {
    super();

    this.cameraComponent = new TCameraComponent(this);
  }

  /**
   * Move the camera by a specified amount
   */
  public move(x: number, y: number, z = 0) {
    this.cameraComponent.transform.translation = vec3.add(
      vec3.create(),
      this.cameraComponent.transform.translation,
      vec3.fromValues(x, y, z)
    );
  }

  /**
   * Set the camera to a given position
   */
  public lookAt(x: number, y: number, z = 0) {
    this.cameraComponent.transform.translation = vec3.fromValues(x, y, z);
  }
}
