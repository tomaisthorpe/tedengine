import type TEngine from '../engine/engine';
import {
  ComponentManager,
  type ComponentData,
  type ComponentTypeId,
} from './component-manager';
import { EntityManager, type EntityId } from './entity-manager';
import { SystemManager, type System } from './system-manager';

/**
 * ECS World - the main container for the ECS architecture
 */
export class ECSWorld {
  private entityManager: EntityManager;
  private componentManager: ComponentManager;
  private systemManager: SystemManager;
  private engine: TEngine;

  constructor(engine: TEngine) {
    this.engine = engine;
    this.entityManager = new EntityManager();
    this.componentManager = new ComponentManager();
    this.systemManager = new SystemManager();
  }

  /**
   * Get the entity manager
   */
  public getEntityManager(): EntityManager {
    return this.entityManager;
  }

  /**
   * Get the component manager
   */
  public getComponentManager(): ComponentManager {
    return this.componentManager;
  }

  /**
   * Get the system manager
   */
  public getSystemManager(): SystemManager {
    return this.systemManager;
  }

  /**
   * Get the engine
   */
  public getEngine(): TEngine {
    return this.engine;
  }

  /**
   * Create a new entity
   * @param name Optional name for the entity
   */
  public createEntity(name?: string): EntityId {
    return this.entityManager.createEntity(name);
  }

  /**
   * Destroy an entity and remove all its components
   * @param entityId The entity to destroy
   */
  public destroyEntity(entityId: EntityId): void {
    this.componentManager.removeAllComponents(entityId);
    this.entityManager.destroyEntity(entityId);
  }

  /**
   * Add a component to an entity
   * @param entityId The entity to add the component to
   * @param typeId The component type ID
   * @param data The component data
   */
  public addComponent<T extends ComponentData>(
    entityId: EntityId,
    typeId: ComponentTypeId,
    data: T,
  ): void {
    this.componentManager.addComponent(entityId, typeId, data);
  }

  /**
   * Get a component from an entity
   * @param entityId The entity to get the component from
   * @param typeId The component type ID
   */
  public getComponent<T extends ComponentData>(
    entityId: EntityId,
    typeId: ComponentTypeId,
  ): T | undefined {
    return this.componentManager.getComponent<T>(entityId, typeId);
  }

  /**
   * Remove a component from an entity
   * @param entityId The entity to remove the component from
   * @param typeId The component type ID
   */
  public removeComponent(entityId: EntityId, typeId: ComponentTypeId): void {
    this.componentManager.removeComponent(entityId, typeId);
  }

  /**
   * Check if an entity has a component
   * @param entityId The entity to check
   * @param typeId The component type ID
   */
  public hasComponent(entityId: EntityId, typeId: ComponentTypeId): boolean {
    return this.componentManager.hasComponent(entityId, typeId);
  }

  /**
   * Get all entities that have a specific component
   * @param typeId The component type ID
   */
  public getEntitiesWithComponent(typeId: ComponentTypeId): EntityId[] {
    return this.componentManager.getEntitiesWithComponent(typeId);
  }

  /**
   * Get all entities that have all of the specified components
   * @param typeIds The component type IDs
   */
  public getEntitiesWithComponents(typeIds: ComponentTypeId[]): EntityId[] {
    return this.componentManager.getEntitiesWithComponents(typeIds);
  }

  /**
   * Register a system
   * @param system The system to register
   */
  public registerSystem(system: System): void {
    this.systemManager.registerSystem(system);
  }

  /**
   * Initialize all systems
   */
  public initializeSystems(): void {
    this.systemManager.initializeSystems(this);
  }

  /**
   * Update all systems
   * @param delta Time since last update
   */
  public update(delta: number): void {
    this.systemManager.updateSystems(this, delta);
  }

  /**
   * Serialize an entity to a JSON-compatible object
   * @param entityId The entity to serialize
   */
  public serializeEntity(entityId: EntityId): Record<string, unknown> {
    const result: Record<string, unknown> = {
      id: entityId,
      name: this.entityManager.getEntityName(entityId),
      components: {},
    };

    // Get all component types
    const componentTypes = Array.from(
      this.componentManager['componentTypes'].keys(),
    );

    // For each component type, check if the entity has it and serialize if it does
    for (const typeId of componentTypes) {
      if (this.hasComponent(entityId, typeId)) {
        const serialized = this.componentManager.serializeComponent(
          entityId,
          typeId,
        );
        (result.components as Record<string, unknown>)[typeId] = serialized;
      }
    }

    return result;
  }

  /**
   * Deserialize an entity from a serialized object
   * @param serialized The serialized entity data
   * @returns The ID of the created entity
   */
  public deserializeEntity(serialized: Record<string, unknown>): EntityId {
    const entityId =
      (serialized.id as EntityId) ||
      this.createEntity(serialized.name as string);

    if (!this.entityManager.hasEntity(entityId)) {
      // If the entity doesn't exist, create it with the same ID
      this.entityManager['entities'].add(entityId);

      if (serialized.name) {
        this.entityManager.setEntityName(entityId, serialized.name as string);
      }
    }

    // Deserialize components
    const components = serialized.components as Record<string, unknown>;
    if (components) {
      for (const [typeId, componentData] of Object.entries(components)) {
        this.componentManager.deserializeComponent(
          entityId,
          typeId,
          componentData,
        );
      }
    }

    return entityId;
  }

  /**
   * Serialize the entire world to a JSON-compatible object
   */
  public serialize(): Record<string, unknown> {
    const entities = this.entityManager.getAllEntities();
    const serializedEntities = entities.map((entityId) =>
      this.serializeEntity(entityId),
    );

    return {
      entities: serializedEntities,
    };
  }

  /**
   * Deserialize the entire world from a serialized object
   * @param serialized The serialized world data
   */
  public deserialize(serialized: Record<string, unknown>): void {
    // Clear existing entities
    const existingEntities = this.entityManager.getAllEntities();
    for (const entityId of existingEntities) {
      this.destroyEntity(entityId);
    }

    // Deserialize entities
    const entities = serialized.entities as Record<string, unknown>[];
    if (entities) {
      for (const entityData of entities) {
        this.deserializeEntity(entityData);
      }
    }
  }
}
