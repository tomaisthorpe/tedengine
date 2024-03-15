import type { vec2 } from 'gl-matrix';
import { mat4, vec3 } from 'gl-matrix';
import TSceneComponent from '../actor-components/scene-component';
import TPawn from '../core/pawn';
import type TEngine from '../engine/engine';
import { TProjectionType } from '../graphics';
import TController from '../input/controller';
import type { ICamera } from './camera';
import TCameraComponent from './camera-component';
import type { TCameraView } from './camera-view';
import { clipToWorldSpace } from './base-camera';

export default class TOrbitCamera extends TPawn implements ICamera {
  private container: TSceneComponent;
  public cameraComponent: TCameraComponent;
  public speed = 1;
  public enableDrag = true;

  private paused = false;

  private lastMouseX = 0;
  private lastMouseY = 0;

  private fov = 45;

  constructor(
    private engine: TEngine,
    public distance: number,
  ) {
    super();

    const controller = new TOrbitController(engine);
    controller.possess(this);

    this.container = new TSceneComponent(this);
    this.container.transform.rotateX(-0.4);

    this.cameraComponent = new TCameraComponent(this);
    this.cameraComponent.transform.translation = vec3.fromValues(
      0,
      0,
      distance,
    );

    this.cameraComponent.attachTo(this.container);
  }

  public getView(): TCameraView {
    return {
      projectionType: TProjectionType.Perspective,
      transform: this.cameraComponent.getWorldTransform().getMatrix(),
      fov: this.fov,
    };
  }

  public getProjectionMatrix(width: number, height: number): mat4 {
    const fieldOfView = (this.fov * Math.PI) / 180;
    const aspect = width / height;
    const zNear = 0.1;
    const zFar = 100.0;
    const projection = mat4.create();

    mat4.perspective(projection, fieldOfView, aspect, zNear, zFar);

    const cameraSpace = mat4.invert(
      mat4.create(),
      this.cameraComponent.getWorldTransform().getMatrix(),
    );
    return mat4.multiply(mat4.create(), projection, cameraSpace);
  }

  public clipToWorldSpace(location: vec2): vec3 {
    const projectionMatrix = this.getProjectionMatrix(
      this.engine.renderingSize.width,
      this.engine.renderingSize.height,
    );

    return clipToWorldSpace(projectionMatrix, location);
  }

  public setupController(controller: TController): void {
    super.setupController(controller);

    controller.bindAction('ToggleDrag', 'pressed', this.startDrag.bind(this));
    controller.bindAction('ToggleDrag', 'released', this.stopDrag.bind(this));
  }

  private startDrag() {
    if (!this.enableDrag || !this.engine.mouse) return;

    this.paused = true;

    this.lastMouseX = this.engine.mouse.screen[0];
    this.lastMouseY = this.engine.mouse.screen[1];
  }

  private stopDrag() {
    this.paused = false;
  }

  protected onUpdate(_: TEngine, delta: number): void {
    this.controller?.update();

    if (this.paused && this.engine.mouse) {
      const diffX = this.lastMouseX - this.engine.mouse.screen[0];
      const diffY = this.lastMouseY - this.engine.mouse.screen[1];

      this.rootComponent.transform.rotateY(0.01 * diffX);
      this.container.transform.rotateX(0.01 * diffY);

      this.lastMouseX = this.engine.mouse.screen[0];
      this.lastMouseY = this.engine.mouse.screen[1];
      return;
    }
    this.rootComponent.transform.rotateY(this.speed * delta);
  }
}

class TOrbitController extends TController {
  constructor(engine: TEngine) {
    super(engine.events);

    this.addActionFromMouseEvent('ToggleDrag', 0);
  }
}
