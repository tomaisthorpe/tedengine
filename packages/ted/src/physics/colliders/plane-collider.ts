import { TColliderType } from '.';

export interface TPlaneColliderConfig {
  type: TColliderType.PLANE;
  width: number;
  height: number;
}

export default class TPlaneCollider {
  constructor(public width: number, public height: number) {}

  public getConfig(): TPlaneColliderConfig {
    return {
      type: TColliderType.PLANE,
      width: this.width,
      height: this.height,
    };
  }
}
