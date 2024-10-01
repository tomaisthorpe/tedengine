import type { vec3 } from 'gl-matrix';
import type { TColliderConfig } from './colliders';
import type { TWorldConfig } from '../core/world';

export interface TPhysicsWorldDebug {
  vertices: Float32Array;
  colors: Float32Array;
}

export interface TPhysicsWorld {
  create(config: TWorldConfig): Promise<void>;
  step(
    delta: number,
    debug?: boolean,
  ): {
    bodies: TPhysicsBody[];
    collisions: TPhysicsCollision[];
    debug?: TPhysicsWorldDebug;
  };
  addBody(
    uuid: string,
    collider: TColliderConfig,
    translation: [number, number, number],
    rotation: [number, number, number, number],
    options?: TPhysicsBodyOptions,
  ): void;
  removeBody(uuid: string): void;
  applyCentralForce(uuid: string, force: vec3): void;
  applyCentralImpulse(uuid: string, impulse: vec3): void;
  updateBodyOptions(uuid: string, options: TPhysicsBodyOptions): void;
  updateTransform(
    uuid: string,
    translation: [number, number, number],
    rotation: [number, number, number, number],
  ): void;
  queryLine(
    from: vec3,
    to: vec3,
    options?: TPhysicsQueryOptions,
  ): TPhysicsQueryLineResult[];
  queryArea(
    from: vec3,
    to: vec3,
    options?: TPhysicsQueryOptions,
  ): TPhysicsQueryAreaResult[];
}

export enum TPhysicsBodyType {
  STATIC = 'static',
  DYNAMIC = 'dynamic',
}

export interface TPhysicsBodyOptions {
  fixedRotation?: boolean;
  type?: TPhysicsBodyType;
  linearDamping?: number;
  angularDamping?: number;
  linearVelocity?: vec3;
  angularVelocity?: vec3;
  friction?: number;
  isTrigger?: boolean;
  mass?: number;
}

export interface TPhysicsBody {
  uuid: string;
  translation: [number, number, number];
  rotation: [number, number, number, number];
  angularVelocity: [number, number, number];
  linearVelocity: [number, number, number];
}

export interface TPhysicsCollision {
  bodies: [string, string];
}

export interface TPhysicsQueryLineResult {
  uuid: string;
  distance: number;
}

export interface TPhysicsQueryAreaResult {
  uuid: string;
}

export interface TPhysicsQueryOptions {
  collisionClasses?: string[];
}
