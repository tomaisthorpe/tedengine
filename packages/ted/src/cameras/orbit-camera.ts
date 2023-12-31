import { vec3 } from 'gl-matrix';
import TSceneComponent from '../actor-components/scene-component';
import TPawn from '../core/pawn';
import type TEngine from '../engine/engine';
import { TProjectionType } from '../graphics';
import TController from '../input/controller';
import type { ICamera } from './camera';
import TCameraComponent from './camera-component';
import type { TCameraView } from './camera-view';

export default class TOrbitCamera extends TPawn implements ICamera {
  private container: TSceneComponent;
  public cameraComponent: TCameraComponent;
  public speed = 1;
  public enableDrag = true;

  private paused = false;

  private lastMouseX = 0;
  private lastMouseY = 0;

  constructor(private engine: TEngine, public distance: number) {
    super();

    const controller = new TOrbitController(engine);
    controller.possess(this);

    this.container = new TSceneComponent(this);
    this.container.transform.rotateX(-0.4);

    this.cameraComponent = new TCameraComponent(this);
    this.cameraComponent.transform.translation = vec3.fromValues(
      0,
      0,
      distance
    );

    this.cameraComponent.attachTo(this.container);
  }

  public getView(): TCameraView {
    return {
      projectionType: TProjectionType.Perspective,
      transform: this.cameraComponent.getWorldTransform().getMatrix(),
      fov: 45,
    };
  }

  public setupController(controller: TController): void {
    super.setupController(controller);

    controller.bindAction('ToggleDrag', 'pressed', this.startDrag.bind(this));
    controller.bindAction('ToggleDrag', 'released', this.stopDrag.bind(this));
  }

  private startDrag() {
    if (!this.enableDrag) return;

    this.paused = true;

    this.lastMouseX = this.engine.mouse.x;
    this.lastMouseY = this.engine.mouse.y;
  }

  private stopDrag() {
    this.paused = false;
  }

  protected onUpdate(_: TEngine, delta: number): void {
    this.controller?.update();

    if (this.paused) {
      const diffX = this.lastMouseX - this.engine.mouse.x;
      const diffY = this.lastMouseY - this.engine.mouse.y;

      this.rootComponent.transform.rotateY(0.01 * diffX);
      this.container.transform.rotateX(0.01 * diffY);

      this.lastMouseX = this.engine.mouse.x;
      this.lastMouseY = this.engine.mouse.y;
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
