import type { TColliderConfig } from './colliders';
import type { TWorldConfig } from '../core/world';
import type {
  TPhysicsBody,
  TPhysicsBodyOptions,
  TPhysicsCollision,
} from './physics-world';
import type { TPhysicsStateChange } from './state-changes';

export enum TPhysicsMessageTypes {
  INIT = 'init',
  WORLD_SETUP = 'world_setup',
  WORLD_CREATED = 'world_created',
  SIMULATE_STEP = 'simulate_step',
  SIMULATE_DONE = 'simulate_done',
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
  newBodies: TPhysicsRegisterBody[];
  stateChanges: TPhysicsStateChange[];
}

export interface TPhysicsRegisterBody {
  uuid: string;
  collider: TColliderConfig;
  translation: [number, number, number];
  rotation: [number, number, number, number];
  mass: number;
  options?: TPhysicsBodyOptions;
}

export interface TPhysicsOutMessageSimulateDone {
  type: TPhysicsMessageTypes.SIMULATE_DONE;
  bodies: TPhysicsBody[];
  collisions: TPhysicsCollision[];
  stepElapsedTime: number;
}
