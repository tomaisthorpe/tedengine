import { TColliderType } from '.';

export interface TSphereColliderConfig {
  type: TColliderType.SPHERE;
  radius: number;
  collisionClass?: string;
}

export default class TSphereCollider {
  constructor(public radius: number, private collisionClass?: string) {}

  public getConfig(): TSphereColliderConfig {
    return {
      type: TColliderType.SPHERE,
      radius: this.radius,
      collisionClass: this.collisionClass,
    };
  }
}
