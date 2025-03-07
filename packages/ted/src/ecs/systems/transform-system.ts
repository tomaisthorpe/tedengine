import { mat4 } from 'gl-matrix';
import type { System } from '../system-manager';
import type { ECSWorld } from '../world';
import type { EntityId } from '../entity-manager';
import {
  TRANSFORM_COMPONENT_TYPE,
  getLocalTransformMatrix,
  type TransformComponentData,
} from '../components/transform-component';

/**
 * System ID for the transform system
 */
export const TRANSFORM_SYSTEM_ID = 'transform';

/**
 * Cache of world transform matrices
 */
export class WorldTransformCache {
  private worldMatrices: Map<EntityId, mat4> = new Map();
  private dirty: Set<EntityId> = new Set();

  /**
   * Mark an entity's transform as dirty
   * @param entityId The entity ID
   */
  public markDirty(entityId: EntityId): void {
    this.dirty.add(entityId);
  }

  /**
   * Check if an entity's transform is dirty
   * @param entityId The entity ID
   */
  public isDirty(entityId: EntityId): boolean {
    return this.dirty.has(entityId);
  }

  /**
   * Mark an entity's transform as clean
   * @param entityId The entity ID
   */
  public markClean(entityId: EntityId): void {
    this.dirty.delete(entityId);
  }

  /**
   * Set the world matrix for an entity
   * @param entityId The entity ID
   * @param matrix The world matrix
   */
  public setWorldMatrix(entityId: EntityId, matrix: mat4): void {
    this.worldMatrices.set(entityId, mat4.clone(matrix));
    this.markClean(entityId);
  }

  /**
   * Get the world matrix for an entity
   * @param entityId The entity ID
   */
  public getWorldMatrix(entityId: EntityId): mat4 | undefined {
    return this.worldMatrices.get(entityId);
  }

  /**
   * Clear the cache for an entity
   * @param entityId The entity ID
   */
  public clearEntity(entityId: EntityId): void {
    this.worldMatrices.delete(entityId);
    this.dirty.delete(entityId);
  }
}

/**
 * Transform system - handles transform hierarchy and world transform calculations
 */
export const TransformSystem: System = {
  id: TRANSFORM_SYSTEM_ID,
  name: 'Transform System',
  requiredComponents: [TRANSFORM_COMPONENT_TYPE],
  priority: 0, // Run first

  // Cache for world transforms
  worldTransformCache: new WorldTransformCache(),

  initialize(world: ECSWorld): void {
    // Nothing to initialize
  },

  update(world: ECSWorld, entities: EntityId[], delta: number): void {
    // First pass: mark all transforms as dirty
    for (const entityId of entities) {
      this.worldTransformCache.markDirty(entityId);
    }

    // Second pass: calculate world transforms in the correct order (parents before children)
    const processed = new Set<EntityId>();

    // Process entities without parents first
    for (const entityId of entities) {
      const transform = world.getComponent<TransformComponentData>(
        entityId,
        TRANSFORM_COMPONENT_TYPE,
      );
      if (!transform || transform.parentEntity) {
        continue;
      }

      this.processEntityTransform(world, entityId, processed);
    }

    // Process remaining entities (those with parents)
    for (const entityId of entities) {
      if (!processed.has(entityId)) {
        this.processEntityTransform(world, entityId, processed);
      }
    }
  },

  /**
   * Process an entity's transform and its children recursively
   * @param world The ECS world
   * @param entityId The entity ID
   * @param processed Set of processed entities
   */
  processEntityTransform(
    world: ECSWorld,
    entityId: EntityId,
    processed: Set<EntityId>,
  ): void {
    // Skip if already processed
    if (processed.has(entityId)) {
      return;
    }

    const transform = world.getComponent<TransformComponentData>(
      entityId,
      TRANSFORM_COMPONENT_TYPE,
    );
    if (!transform) {
      return;
    }

    // If this entity has a parent, process the parent first
    if (transform.parentEntity) {
      this.processEntityTransform(world, transform.parentEntity, processed);
    }

    // Calculate world transform
    const localMatrix = getLocalTransformMatrix(transform);
    let worldMatrix: mat4;

    if (transform.parentEntity) {
      // Get parent's world transform
      const parentWorldMatrix = this.worldTransformCache.getWorldMatrix(
        transform.parentEntity,
      );
      if (!parentWorldMatrix) {
        // Parent not processed yet, skip for now
        return;
      }

      // Multiply parent's world transform with local transform
      worldMatrix = mat4.create();
      mat4.multiply(worldMatrix, parentWorldMatrix, localMatrix);
    } else {
      // No parent, local transform is world transform
      worldMatrix = localMatrix;
    }

    // Store world transform
    this.worldTransformCache.setWorldMatrix(entityId, worldMatrix);

    // Mark as processed
    processed.add(entityId);
  },

  /**
   * Get the world transform matrix for an entity
   * @param entityId The entity ID
   */
  getWorldMatrix(entityId: EntityId): mat4 | undefined {
    return this.worldTransformCache.getWorldMatrix(entityId);
  },

  cleanup(world: ECSWorld): void {
    // Nothing to clean up
  },
};
