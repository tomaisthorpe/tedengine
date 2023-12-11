import { vec3 } from 'gl-matrix';
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
  public moveBy(vec: vec3) {
    this.cameraComponent.transform.translation = vec3.add(
      vec3.create(),
      this.cameraComponent.transform.translation,
      vec
    );
  }

  /**
   * Set the camera to a given position
   */
  public moveTo(position: vec3) {
    this.cameraComponent.transform.translation = vec3.clone(position);
  }

  /**
   * Adjusts the camera's rotation so it is looking towards a given position.
   *
   * @param target - The target position as a vec3
   */
  public lookAt(target: vec3) {
    this.cameraComponent.transform.lookAt(target);
  }
}
