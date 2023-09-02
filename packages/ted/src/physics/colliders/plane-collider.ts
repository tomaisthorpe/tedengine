import { TColliderType } from '.';
import type TActor from '../../core/actor';
import type TEngine from '../../engine/engine';
import TBaseCollider from './base-collider';

export interface TPlaneColliderConfig {
  type: TColliderType.PLANE;
  width: number;
  height: number;
  collisionClass?: string;
}

export default class TPlaneCollider extends TBaseCollider {
  constructor(
    engine: TEngine,
    actor: TActor,
    public width: number,
    public height: number,
    private collisionClass?: string
  ) {
    super(engine.events, actor);
  }

  public getConfig(): TPlaneColliderConfig {
    return {
      type: TColliderType.PLANE,
      width: this.width,
      height: this.height,
      collisionClass: this.collisionClass,
    };
  }
}
