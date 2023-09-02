import type { TColliderListener } from './base-collider';
import type { TBoxColliderConfig } from './box-collider';
import type { TPlaneColliderConfig } from './plane-collider';
import type { TSphereColliderConfig } from './sphere-collider';

export interface ICollider {
  addListener(collisionClass: string, func: TColliderListener): void;
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
