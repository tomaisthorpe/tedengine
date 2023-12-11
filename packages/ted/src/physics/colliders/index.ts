import type { TBoxColliderConfig } from './box-collider';
import type { TPlaneColliderConfig } from './plane-collider';
import type { TSphereColliderConfig } from './sphere-collider';

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
