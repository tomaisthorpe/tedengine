import { TColliderType } from '.';

export interface TPlaneColliderConfig {
  type: TColliderType.PLANE;
  width: number;
  height: number;
  collisionClass?: string;
}

export default class TPlaneCollider {
  constructor(
    public width: number,
    public height: number,
    private collisionClass?: string
  ) {}

  public getConfig(): TPlaneColliderConfig {
    return {
      type: TColliderType.PLANE,
      width: this.width,
      height: this.height,
      collisionClass: this.collisionClass,
    };
  }
}
