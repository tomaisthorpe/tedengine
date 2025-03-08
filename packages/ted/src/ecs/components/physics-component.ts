import { vec3 } from 'gl-matrix';
import { ComponentData } from '../component-manager';
import type {
  TPhysicsBodyOptions,
  TPhysicsBodyType,
} from '../../physics/physics-world';
import type { ICollider } from '../../physics/colliders';

export const PHYSICS_COMPONENT_TYPE = 'physics';

/**
 * Physics component data
 */
export interface PhysicsComponentData extends ComponentData {
  bodyOptions: TPhysicsBodyOptions;
  collider?: ICollider;
  collisionClass?: string;
}

/**
 * Create a new physics component
 */
export function createPhysicsComponent(): PhysicsComponentData {
  return {
    bodyOptions: {
      mass: 1,
      type: 'dynamic',
    },
  };
}
