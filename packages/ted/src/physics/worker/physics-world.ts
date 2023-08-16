import type { vec3 } from 'gl-matrix';
import type { TColliderConfig } from '../colliders';
import type { TWorldConfig } from '../world';

export interface TPhysicsWorld {
  create(config: TWorldConfig): Promise<void>;
  step(delta: number): void;
  addBody(
    uuid: string,
    collider: TColliderConfig,
    translation: [number, number, number],
    rotation: [number, number, number, number],
    mass: number
  ): void;
  applyCentralForce(uuid: string, force: vec3): void;
  applyCentralImpulse(uuid: string, impulse: vec3): void;
}
