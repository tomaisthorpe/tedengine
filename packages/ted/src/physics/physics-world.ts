import type { vec3 } from 'gl-matrix';
import type { TColliderConfig } from './colliders';
import type { TWorldConfig } from '../core/world';

export interface TPhysicsWorld {
  create(config: TWorldConfig): Promise<void>;
  step(delta: number): {
    bodies: TPhysicsBody[];
    collisions: TPhysicsCollision[];
  };
  addBody(
    uuid: string,
    collider: TColliderConfig,
    translation: [number, number, number],
    rotation: [number, number, number, number],
    mass: number,
    options?: TPhysicsBodyOptions
  ): void;
  applyCentralForce(uuid: string, force: vec3): void;
  applyCentralImpulse(uuid: string, impulse: vec3): void;
  updateBodyOptions(uuid: string, options: TPhysicsBodyOptions): void;
}

export enum TPhysicsBodyType {
  STATIC = 'static',
  DYNAMIC = 'dynamic',
}

export interface TPhysicsBodyOptions {
  fixedRotation?: boolean;
  type?: TPhysicsBodyType;
}

export interface TPhysicsBody {
  uuid: string;
  translation: [number, number, number];
  rotation: [number, number, number, number];
}

export interface TPhysicsCollision {
  bodies: [string, string];
}
