import type TEngine from '../engine/engine';
import TMeshComponent from './mesh-component';

/**
 * Simple component that rotates a mesh about the Y axis
 */
export default class TRotatingComponent extends TMeshComponent {
  public paused = false;

  /**
   * Rotate the mesh around the Y axis
   */
  protected onUpdate(engine: TEngine, delta: number) {
    if (this.paused) return;

    this.transform.rotateY(delta * 0.5);
    this.transform.rotateZ(delta * 0.5 * 0.7);
    this.applyTransform();
  }
}
