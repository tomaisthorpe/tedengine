import { TColliderType } from '.';

export interface TSphereColliderConfig {
  type: TColliderType.SPHERE;
  radius: number;
}

export default class TSphereCollider {
  constructor(public radius: number) {}

  public getConfig(): TSphereColliderConfig {
    return {
      type: TColliderType.SPHERE,
      radius: this.radius,
    };
  }
}
