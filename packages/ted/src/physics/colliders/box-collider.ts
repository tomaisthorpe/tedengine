import { TColliderType } from '.';

export interface TBoxColliderConfig {
  type: TColliderType.BOX;
  width: number;
  height: number;
  depth: number;
  collisionClass?: string;
}

export default class TBoxCollider {
  constructor(
    public width: number,
    public height: number,
    public depth: number,
    private collisionClass?: string
  ) {}

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
