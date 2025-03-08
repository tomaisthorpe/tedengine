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
}
