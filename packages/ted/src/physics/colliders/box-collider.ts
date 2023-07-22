import { TColliderType } from '.';

export interface TBoxColliderConfig {
  type: TColliderType.BOX;
  width: number;
  height: number;
  depth: number;
}

export default class TBoxCollider {
  constructor(
    public width: number,
    public height: number,
    public depth: number
  ) {}

  public getConfig(): TBoxColliderConfig {
    return {
      type: TColliderType.BOX,
      width: this.width,
      height: this.height,
      depth: this.depth,
    };
  }
}
