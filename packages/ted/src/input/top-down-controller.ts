import type { ICamera } from '../cameras/camera';
import type TEventQueue from '../core/event-queue';
import TSimpleController from './simple-controller';

/**
 * TTopDownController builds on TSimpleController to add facing towards the mouse.
 */
export default class TTopDownController extends TSimpleController {
  public angle = 0;

  constructor(
    eventQueue: TEventQueue,
    private camera: ICamera,
  ) {
    super(eventQueue);
  }

  public update(): void {
    super.update();

    if (!this.possessing) return;

    if (this.mouseLocation) {
      const worldSpace = this.camera.clipToWorldSpace(this.mouseLocation.clip);

      const rootComponent = this.possessing.rootComponent;
      const transform = rootComponent.getWorldTransform();

      const dx = transform.translation[0] - worldSpace[0];
      const dy = transform.translation[1] - worldSpace[1];

      this.angle = Math.atan2(dy, dx);
    }
  }
}
