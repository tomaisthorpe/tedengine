import type { vec3 } from 'gl-matrix';
import type { TColliderConfig } from '../colliders';
import type { TWorldConfig } from '../world';
import type { TPhysicsBody } from './dynamic-world';

export enum TPhysicsMessageTypes {
  INIT = 'init',
  WORLD_SETUP = 'world_setup',
  WORLD_CREATED = 'world_created',
  SIMULATE_STEP = 'simulate_step',
  SIMULATE_DONE = 'simulate_done',
  REGISTER_BODY = 'body_register',
  APPLY_CENTRAL_FORCE = 'apply_central_force',
  APPLY_CENTRAL_IMPULSE = 'apply_central_impulse',
}

export interface TPhysicsOutMessageInit {
  type: TPhysicsMessageTypes.INIT;
}

export interface TPhysicsInMessageWorldSetup {
  type: TPhysicsMessageTypes.WORLD_SETUP;
  config: TWorldConfig;
}

export interface TPhysicsOutMessageWorldCreated {
  type: TPhysicsMessageTypes.WORLD_CREATED;
}

export interface TPhysicsInMessageSimulateStep {
  type: TPhysicsMessageTypes.SIMULATE_STEP;
  delta: number;
}

export interface TPhysicsOutMessageSimulateDone {
  type: TPhysicsMessageTypes.SIMULATE_DONE;
  bodies: TPhysicsBody[];
}

export interface TPhysicsInMessageRegisterBody {
  type: TPhysicsMessageTypes.REGISTER_BODY;
  uuid: string;
  collider: TColliderConfig;
  translation: [number, number, number];
  rotation: [number, number, number, number];
  mass: number;
}

export interface TPhysicsInMessageApplyCentralForce {
  type: TPhysicsMessageTypes.APPLY_CENTRAL_FORCE;
  uuid: string;
  force: vec3;
}

export interface TPhysicsInMessageApplyCentralImpulse {
  type: TPhysicsMessageTypes.APPLY_CENTRAL_IMPULSE;
  uuid: string;
  impulse: vec3;
}
