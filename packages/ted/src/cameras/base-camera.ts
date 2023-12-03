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
}
