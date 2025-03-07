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

/**
 * Serialize a physics component
 * @param data The physics component data
 */
export function serializePhysicsComponent(data: PhysicsComponentData): unknown {
  const result: Record<string, unknown> = {
    bodyOptions: { ...data.bodyOptions },
    collisionClass: data.collisionClass,
  };

  // Convert vec3 properties to arrays for serialization
  if (data.bodyOptions.linearVelocity) {
    result.bodyOptions.linearVelocity = Array.from(
      data.bodyOptions.linearVelocity,
    );
  }

  if (data.bodyOptions.angularVelocity) {
    result.bodyOptions.angularVelocity = Array.from(
      data.bodyOptions.angularVelocity,
    );
  }

  // We don't serialize the collider directly as it's complex and will be recreated
  // Instead, we'll need to store collider type and parameters separately
  if (data.collider) {
    result.colliderType = data.collider.type;
    result.colliderParams = data.collider.getSerializableParams();
  }

  return result;
}

/**
 * Deserialize a physics component
 * @param serialized The serialized physics component data
 */
export function deserializePhysicsComponent(
  serialized: unknown,
): PhysicsComponentData {
  const data = serialized as Record<string, unknown>;

  const result: PhysicsComponentData = {
    bodyOptions: {
      mass: 1,
      type: 'dynamic',
    },
  };

  if (data.bodyOptions) {
    const bodyOptions = data.bodyOptions as Record<string, unknown>;

    // Copy basic properties
    if (bodyOptions.mass !== undefined) {
      result.bodyOptions.mass = bodyOptions.mass as number;
    }

    if (bodyOptions.type !== undefined) {
      result.bodyOptions.type = bodyOptions.type as TPhysicsBodyType;
    }

    if (bodyOptions.fixedRotation !== undefined) {
      result.bodyOptions.fixedRotation = bodyOptions.fixedRotation as boolean;
    }

    if (bodyOptions.linearDamping !== undefined) {
      result.bodyOptions.linearDamping = bodyOptions.linearDamping as number;
    }

    if (bodyOptions.angularDamping !== undefined) {
      result.bodyOptions.angularDamping = bodyOptions.angularDamping as number;
    }

    if (bodyOptions.friction !== undefined) {
      result.bodyOptions.friction = bodyOptions.friction as number;
    }

    if (bodyOptions.isTrigger !== undefined) {
      result.bodyOptions.isTrigger = bodyOptions.isTrigger as boolean;
    }

    // Convert array properties back to vec3
    if (
      bodyOptions.linearVelocity &&
      Array.isArray(bodyOptions.linearVelocity)
    ) {
      const linearVelocity = vec3.create();
      vec3.set(
        linearVelocity,
        bodyOptions.linearVelocity[0] as number,
        bodyOptions.linearVelocity[1] as number,
        bodyOptions.linearVelocity[2] as number,
      );
      result.bodyOptions.linearVelocity = linearVelocity;
    }

    if (
      bodyOptions.angularVelocity &&
      Array.isArray(bodyOptions.angularVelocity)
    ) {
      const angularVelocity = vec3.create();
      vec3.set(
        angularVelocity,
        bodyOptions.angularVelocity[0] as number,
        bodyOptions.angularVelocity[1] as number,
        bodyOptions.angularVelocity[2] as number,
      );
      result.bodyOptions.angularVelocity = angularVelocity;
    }
  }

  if (data.collisionClass) {
    result.collisionClass = data.collisionClass as string;
  }

  // Note: Collider will need to be recreated by a system after deserialization
  // as it depends on the physics world implementation

  return result;
}
