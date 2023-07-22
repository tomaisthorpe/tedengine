import TSceneComponent from '../actor-components/scene-component';
import type TActor from '../core/actor';
import TDebugCamera from '../debug/debug-camera';
import type TEngine from '../engine/engine';

export default class TCameraComponent extends TSceneComponent {
  public showDebug = false;
  private debugCamera?: TDebugCamera;

  constructor(actor: TActor) {
    super(actor);

    this.canRender = false;
    this.shouldRender = false;
  }

  public showDebugCamera(engine: TEngine): void {
    if (!this.debugCamera) {
      this.debugCamera = new TDebugCamera(engine, this.actor);
      this.debugCamera.attachTo(this);
    }
  }

  public hideDebugCamera(): void {
    if (this.debugCamera) {
      this.debugCamera.shouldRender = false;
    }
  }
}
