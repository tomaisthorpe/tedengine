import type { EntityId } from './entity-manager';

/**
 * Unique identifier for a component type
 */
export type ComponentTypeId = string;

/**
 * Base interface for all component data
 */
export interface ComponentData {
  // This is intentionally empty as it's just a marker interface
}

/**
 * Component type registration information
 */
export interface ComponentType<T extends ComponentData> {
  id: ComponentTypeId;
  name: string;
  create: () => T;
}

/**
 * Component Manager - responsible for managing components and their association with entities
 */
export class ComponentManager {
  private componentTypes: Map<ComponentTypeId, ComponentType<any>> = new Map();
  private componentsByType: Map<ComponentTypeId, Map<EntityId, ComponentData>> =
    new Map();

  /**
   * Register a new component type
   * @param componentType The component type to register
   */
  public registerComponentType<T extends ComponentData>(
    componentType: ComponentType<T>,
  ): void {
    if (this.componentTypes.has(componentType.id)) {
      throw new Error(
        `Component type ${componentType.id} is already registered`,
      );
    }

    this.componentTypes.set(componentType.id, componentType);
    this.componentsByType.set(componentType.id, new Map());
  }

  /**
   * Get a registered component type
   * @param typeId The component type ID
   */
  public getComponentType<T extends ComponentData>(
    typeId: ComponentTypeId,
  ): ComponentType<T> {
    const type = this.componentTypes.get(typeId);
    if (!type) {
      throw new Error(`Component type ${typeId} is not registered`);
    }

    return type as ComponentType<T>;
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
    if (!this.componentTypes.has(typeId)) {
      throw new Error(`Component type ${typeId} is not registered`);
    }

    const componentsOfType = this.componentsByType.get(typeId);
    if (!componentsOfType) {
      throw new Error(`Component storage for type ${typeId} not initialized`);
    }

    componentsOfType.set(entityId, data);
  }

  /**
   * Check if an entity has a component of a specific type
   * @param entityId The entity to check
   * @param typeId The component type ID
   */
  public hasComponent(entityId: EntityId, typeId: ComponentTypeId): boolean {
    const componentsOfType = this.componentsByType.get(typeId);
    if (!componentsOfType) {
      return false;
    }

    return componentsOfType.has(entityId);
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
    const componentsOfType = this.componentsByType.get(typeId);
    if (!componentsOfType) {
      return undefined;
    }

    return componentsOfType.get(entityId) as T | undefined;
  }

  /**
   * Remove a component from an entity
   * @param entityId The entity to remove the component from
   * @param typeId The component type ID
   */
  public removeComponent(entityId: EntityId, typeId: ComponentTypeId): void {
    const componentsOfType = this.componentsByType.get(typeId);
    if (!componentsOfType) {
      return;
    }

    componentsOfType.delete(entityId);
  }

  /**
   * Remove all components from an entity
   * @param entityId The entity to remove all components from
   */
  public removeAllComponents(entityId: EntityId): void {
    for (const componentsOfType of this.componentsByType.values()) {
      componentsOfType.delete(entityId);
    }
  }

  /**
   * Get all entities that have a specific component type
   * @param typeId The component type ID
   */
  public getEntitiesWithComponent(typeId: ComponentTypeId): EntityId[] {
    const componentsOfType = this.componentsByType.get(typeId);
    if (!componentsOfType) {
      return [];
    }

    return Array.from(componentsOfType.keys());
  }

  /**
   * Get all entities that have all of the specified component types
   * @param typeIds The component type IDs
   */
  public getEntitiesWithComponents(typeIds: ComponentTypeId[]): EntityId[] {
    if (typeIds.length === 0) {
      return [];
    }

    // Start with entities that have the first component type
    const firstTypeId = typeIds[0];
    const componentsOfFirstType = this.componentsByType.get(firstTypeId);
    if (!componentsOfFirstType) {
      return [];
    }

    const candidateEntities = Array.from(componentsOfFirstType.keys());

    // Filter entities that have all other component types
    return candidateEntities.filter((entityId) => {
      for (let i = 1; i < typeIds.length; i++) {
        if (!this.hasComponent(entityId, typeIds[i])) {
          return false;
        }
      }
      return true;
    });
  }
}
