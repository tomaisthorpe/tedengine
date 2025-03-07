import { v4 as uuidv4 } from 'uuid';

/**
 * Unique identifier for an entity
 */
export type EntityId = string;

/**
 * Entity Manager - responsible for creating, tracking and destroying entities
 */
export class EntityManager {
  private entities: Set<EntityId> = new Set();
  private entityNames: Map<EntityId, string> = new Map();
  private entityTags: Map<EntityId, Set<string>> = new Map();

  /**
   * Create a new entity
   * @param name Optional name for the entity
   * @returns The ID of the newly created entity
   */
  public createEntity(name?: string): EntityId {
    const id = uuidv4();
    this.entities.add(id);

    if (name) {
      this.entityNames.set(id, name);
    }

    this.entityTags.set(id, new Set());

    return id;
  }

  /**
   * Check if an entity exists
   * @param entityId The entity ID to check
   */
  public hasEntity(entityId: EntityId): boolean {
    return this.entities.has(entityId);
  }

  /**
   * Destroy an entity
   * @param entityId The entity to destroy
   */
  public destroyEntity(entityId: EntityId): void {
    if (!this.entities.has(entityId)) {
      return;
    }

    this.entities.delete(entityId);
    this.entityNames.delete(entityId);
    this.entityTags.delete(entityId);
  }

  /**
   * Get all entities
   */
  public getAllEntities(): EntityId[] {
    return Array.from(this.entities);
  }

  /**
   * Set a name for an entity
   * @param entityId The entity to name
   * @param name The name to set
   */
  public setEntityName(entityId: EntityId, name: string): void {
    if (!this.entities.has(entityId)) {
      throw new Error(`Entity ${entityId} does not exist`);
    }

    this.entityNames.set(entityId, name);
  }

  /**
   * Get the name of an entity
   * @param entityId The entity to get the name for
   */
  public getEntityName(entityId: EntityId): string | undefined {
    return this.entityNames.get(entityId);
  }

  /**
   * Add a tag to an entity
   * @param entityId The entity to tag
   * @param tag The tag to add
   */
  public addTag(entityId: EntityId, tag: string): void {
    if (!this.entities.has(entityId)) {
      throw new Error(`Entity ${entityId} does not exist`);
    }

    const tags = this.entityTags.get(entityId);
    if (tags) {
      tags.add(tag);
    }
  }

  /**
   * Remove a tag from an entity
   * @param entityId The entity to remove the tag from
   * @param tag The tag to remove
   */
  public removeTag(entityId: EntityId, tag: string): void {
    if (!this.entities.has(entityId)) {
      throw new Error(`Entity ${entityId} does not exist`);
    }

    const tags = this.entityTags.get(entityId);
    if (tags) {
      tags.delete(tag);
    }
  }

  /**
   * Check if an entity has a tag
   * @param entityId The entity to check
   * @param tag The tag to check for
   */
  public hasTag(entityId: EntityId, tag: string): boolean {
    if (!this.entities.has(entityId)) {
      return false;
    }

    const tags = this.entityTags.get(entityId);
    return tags ? tags.has(tag) : false;
  }

  /**
   * Get all entities with a specific tag
   * @param tag The tag to filter by
   */
  public getEntitiesWithTag(tag: string): EntityId[] {
    const result: EntityId[] = [];

    for (const [entityId, tags] of this.entityTags.entries()) {
      if (tags.has(tag)) {
        result.push(entityId);
      }
    }

    return result;
  }
}
