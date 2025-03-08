export interface ICollider {
  getConfig(): TColliderConfig;
}

export enum TColliderType {
  BOX = 'box',
  PLANE = 'plane',
  SPHERE = 'sphere',
}

export type TColliderConfig =
  | TBoxColliderConfig
  | TPlaneColliderConfig
  | TSphereColliderConfig;

export interface TBoxColliderConfig {
  type: TColliderType.BOX;
  width: number;
  height: number;
  depth: number;
  collisionClass?: string;
}

export function createBoxCollider(
  width: number,
  height: number,
  depth: number,
  collisionClass?: string,
): TBoxColliderConfig {
  return {
    type: TColliderType.BOX,
    width,
    height,
    depth,
    collisionClass,
  };
}

export interface TPlaneColliderConfig {
  type: TColliderType.PLANE;
  width: number;
  height: number;
  collisionClass?: string;
}

export function createPlaneCollider(
  width: number,
  height: number,
  collisionClass?: string,
): TPlaneColliderConfig {
  return {
    type: TColliderType.PLANE,
    width,
    height,
    collisionClass,
  };
}

export interface TSphereColliderConfig {
  type: TColliderType.SPHERE;
  radius: number;
  collisionClass?: string;
}

export function createSphereCollider(
  radius: number,
  collisionClass?: string,
): TSphereColliderConfig {
  return { type: TColliderType.SPHERE, radius, collisionClass };
}
