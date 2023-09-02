import { TColliderType } from '.';
import type TActor from '../../core/actor';
import type TEngine from '../../engine/engine';
import TBaseCollider from './base-collider';

export interface TSphereColliderConfig {
  type: TColliderType.SPHERE;
  radius: number;
  collisionClass?: string;
}

export default class TSphereCollider extends TBaseCollider {
  constructor(
    engine: TEngine,
    actor: TActor,
    public radius: number,
    private collisionClass?: string
  ) {
    super(engine.events, actor);
  }

  public getConfig(): TSphereColliderConfig {
    return {
      type: TColliderType.SPHERE,
      radius: this.radius,
      collisionClass: this.collisionClass,
    };
  }
}
