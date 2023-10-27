import type { vec3 } from 'gl-matrix';
import type { TPhysicsBodyOptions } from './physics-world';

export enum TPhysicsStateChangeType {
  APPLY_CENTRAL_FORCE = 'apply_force',
  APPLY_CENTRAL_IMPULSE = 'apply_central_impulse',
  UPDATE_BODY_OPTIONS = 'update_body_options',
  UPDATE_TRANSFORM = 'update_transform',
}

export type TPhysicsStateChange =
  | TPhysicsApplyCentralForce
  | TPhysicsApplyCentralImpulse
  | TPhysicsUpdateBodyOptions
  | TPhysicsUpdateTransform;

export interface TPhysicsApplyCentralForce {
  type: TPhysicsStateChangeType.APPLY_CENTRAL_FORCE;
  uuid: string;
  force: vec3;
}

export interface TPhysicsApplyCentralImpulse {
  type: TPhysicsStateChangeType.APPLY_CENTRAL_IMPULSE;
  uuid: string;
  impulse: vec3;
}

export interface TPhysicsUpdateBodyOptions {
  type: TPhysicsStateChangeType.UPDATE_BODY_OPTIONS;
  uuid: string;
  options: TPhysicsBodyOptions;
}

export interface TPhysicsUpdateTransform {
  type: TPhysicsStateChangeType.UPDATE_TRANSFORM;
  uuid: string;
  translation: [number, number, number];
  rotation: [number, number, number, number];
}
