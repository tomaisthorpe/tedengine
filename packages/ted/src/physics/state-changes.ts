import type { vec3 } from 'gl-matrix';

export enum TPhysicsStateChangeType {
  APPLY_CENTRAL_FORCE = 'apply_force',
  APPLY_CENTRAL_IMPULSE = 'apply_central_impulse',
}

export type TPhysicsStateChange =
  | TPhysicsApplyCentralForce
  | TPhysicsApplyCentralImpulse;

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
