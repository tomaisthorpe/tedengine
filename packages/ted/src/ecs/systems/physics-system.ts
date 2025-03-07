import { vec3 } from 'gl-matrix';
import type { System } from '../system-manager';
import type { ECSWorld } from '../world';
import type { EntityId } from '../entity-manager';
import {
  PHYSICS_COMPONENT_TYPE,
  type PhysicsComponentData,
} from '../components/physics-component';
import {
  TRANSFORM_COMPONENT_TYPE,
  type TransformComponentData,
} from '../components/transform-component';
import { TRANSFORM_SYSTEM_ID } from './transform-system';
import type TWorld from '../../core/world';

/**
 * System ID for the physics system
 */
export const PHYSICS_SYSTEM_ID = 'physics';

/**
 * Physics system - handles physics simulation and integration with the transform system
 */
export const PhysicsSystem: System = {
  id: PHYSICS_SYSTEM_ID,
  name: 'Physics System',
  requiredComponents: [PHYSICS_COMPONENT_TYPE, TRANSFORM_COMPONENT_TYPE],
  priority: 50, // Run after transform system but before render system

  // Map of entity IDs to their corresponding physics bodies
  entityPhysicsBodies: (Map<EntityId, string> = new Map()),

  initialize(world: ECSWorld): void {
    // Nothing to initialize
  },

  update(world: ECSWorld, entities: EntityId[], delta: number): void {
    const tedWorld = this.getTedWorld(world);
    if (!tedWorld) {
      return;
    }

    // First pass: ensure all entities have physics bodies registered
    for (const entityId of entities) {
      this.ensurePhysicsBody(world, tedWorld, entityId);
    }

    // Second pass: update transforms from physics
    for (const entityId of entities) {
      this.updateTransformFromPhysics(world, tedWorld, entityId);
    }
  },

  /**
   * Ensure an entity has a physics body registered
   * @param world The ECS world
   * @param tedWorld The TED world
   * @param entityId The entity ID
   */
  ensurePhysicsBody(
    world: ECSWorld,
    tedWorld: TWorld,
    entityId: EntityId,
  ): void {
    const physicsComponent = world.getComponent<PhysicsComponentData>(
      entityId,
      PHYSICS_COMPONENT_TYPE,
    );
    const transformComponent = world.getComponent<TransformComponentData>(
      entityId,
      TRANSFORM_COMPONENT_TYPE,
    );

    if (!physicsComponent || !transformComponent) {
      return;
    }

    // If the entity already has a physics body, update it
    if (this.entityPhysicsBodies.has(entityId)) {
      const componentUUID = this.entityPhysicsBodies.get(entityId);
      if (componentUUID) {
        // Update body options
        tedWorld.updateBodyOptions(
          { uuid: componentUUID } as any,
          physicsComponent.bodyOptions,
        );

        // Update transform
        tedWorld.updateTransform({ uuid: componentUUID } as any);
      }
    } else {
      // Create a new physics body
      // Note: This is a simplified version, in a real implementation you would need to
      // create a proper scene component and register it with the physics world

      // For now, we'll just track that we've processed this entity
      this.entityPhysicsBodies.set(entityId, entityId);
    }
  },

  /**
   * Update transform from physics
   * @param world The ECS world
   * @param tedWorld The TED world
   * @param entityId The entity ID
   */
  updateTransformFromPhysics(
    world: ECSWorld,
    tedWorld: TWorld,
    entityId: EntityId,
  ): void {
    const physicsComponent = world.getComponent<PhysicsComponentData>(
      entityId,
      PHYSICS_COMPONENT_TYPE,
    );
    const transformComponent = world.getComponent<TransformComponentData>(
      entityId,
      TRANSFORM_COMPONENT_TYPE,
    );

    if (
      !physicsComponent ||
      !transformComponent ||
      !this.entityPhysicsBodies.has(entityId)
    ) {
      return;
    }

    // In a real implementation, you would get the physics body state from the physics world
    // and update the transform component accordingly

    // For now, we'll just simulate this by applying any linear velocity to the position
    if (physicsComponent.bodyOptions.linearVelocity) {
      const velocity = physicsComponent.bodyOptions.linearVelocity;
      const deltaPos = vec3.create();
      vec3.scale(deltaPos, velocity, world.getEngine().deltaTime);
      vec3.add(
        transformComponent.position,
        transformComponent.position,
        deltaPos,
      );
    }
  },

  /**
   * Apply a central force to an entity
   * @param world The ECS world
   * @param entityId The entity ID
   * @param force The force to apply
   */
  applyCentralForce(world: ECSWorld, entityId: EntityId, force: vec3): void {
    const tedWorld = this.getTedWorld(world);
    if (!tedWorld || !this.entityPhysicsBodies.has(entityId)) {
      return;
    }

    const componentUUID = this.entityPhysicsBodies.get(entityId);
    if (componentUUID) {
      tedWorld.applyCentralForce({ uuid: componentUUID } as any, force);
    }
  },

  /**
   * Apply a central impulse to an entity
   * @param world The ECS world
   * @param entityId The entity ID
   * @param impulse The impulse to apply
   */
  applyCentralImpulse(
    world: ECSWorld,
    entityId: EntityId,
    impulse: vec3,
  ): void {
    const tedWorld = this.getTedWorld(world);
    if (!tedWorld || !this.entityPhysicsBodies.has(entityId)) {
      return;
    }

    const componentUUID = this.entityPhysicsBodies.get(entityId);
    if (componentUUID) {
      tedWorld.applyCentralImpulse({ uuid: componentUUID } as any, impulse);
    }
  },

  /**
   * Get the TED world from the ECS world
   * @param world The ECS world
   */
  getTedWorld(world: ECSWorld): TWorld | undefined {
    return world.getEngine().activeWorld;
  },

  cleanup(world: ECSWorld): void {
    // Clean up physics bodies
    const tedWorld = this.getTedWorld(world);
    if (!tedWorld) {
      return;
    }

    for (const [
      entityId,
      componentUUID,
    ] of this.entityPhysicsBodies.entries()) {
      // Remove the physics body
      tedWorld.removeBody({ uuid: componentUUID } as any);
    }

    this.entityPhysicsBodies.clear();
  },
};
