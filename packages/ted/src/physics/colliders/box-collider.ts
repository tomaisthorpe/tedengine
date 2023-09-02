import { TColliderType } from '.';
import type TActor from '../../core/actor';
import type TEngine from '../../engine/engine';
import TBaseCollider from './base-collider';

export interface TBoxColliderConfig {
  type: TColliderType.BOX;
  width: number;
  height: number;
  depth: number;
  collisionClass?: string;
}

export default class TBoxCollider extends TBaseCollider {
  constructor(
    engine: TEngine,
    actor: TActor,
    public width: number,
    public height: number,
    public depth: number,
    private collisionClass?: string
  ) {
    super(engine.events, actor);
  }

  public getConfig(): TBoxColliderConfig {
    return {
      type: TColliderType.BOX,
      width: this.width,
      height: this.height,
      depth: this.depth,
      collisionClass: this.collisionClass,
    };
  }
}
