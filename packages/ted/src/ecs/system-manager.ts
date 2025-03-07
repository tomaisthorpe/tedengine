import type { ComponentTypeId } from './component-manager';
import type { EntityId } from './entity-manager';
import type { ECSWorld } from './world';

/**
 * Unique identifier for a system
 */
export type SystemId = string;

/**
 * Base interface for all systems
 */
export interface System {
  id: SystemId;
  name: string;
  requiredComponents: ComponentTypeId[];
  priority: number;
  initialize?: (world: ECSWorld) => void;
  update: (world: ECSWorld, entities: EntityId[], delta: number) => void;
  cleanup?: (world: ECSWorld) => void;
}

/**
 * System Manager - responsible for managing and executing systems
 */
export class SystemManager {
  private systems: Map<SystemId, System> = new Map();
  private sortedSystems: System[] = [];
  private needsSort = false;

  /**
   * Register a new system
   * @param system The system to register
   */
  public registerSystem(system: System): void {
    if (this.systems.has(system.id)) {
      throw new Error(`System ${system.id} is already registered`);
    }

    this.systems.set(system.id, system);
    this.needsSort = true;
  }

  /**
   * Unregister a system
   * @param systemId The ID of the system to unregister
   */
  public unregisterSystem(systemId: SystemId): void {
    if (!this.systems.has(systemId)) {
      return;
    }

    this.systems.delete(systemId);
    this.needsSort = true;
  }

  /**
   * Get a registered system
   * @param systemId The ID of the system to get
   */
  public getSystem(systemId: SystemId): System | undefined {
    return this.systems.get(systemId);
  }

  /**
   * Initialize all systems
   * @param world The ECS world
   */
  public initializeSystems(world: ECSWorld): void {
    this.sortSystemsIfNeeded();

    for (const system of this.sortedSystems) {
      if (system.initialize) {
        system.initialize(world);
      }
    }
  }

  /**
   * Update all systems
   * @param world The ECS world
   * @param delta Time since last update
   */
  public updateSystems(world: ECSWorld, delta: number): void {
    this.sortSystemsIfNeeded();

    for (const system of this.sortedSystems) {
      const entities = world.getEntitiesWithComponents(
        system.requiredComponents,
      );
      system.update(world, entities, delta);
    }
  }

  /**
   * Clean up all systems
   * @param world The ECS world
   */
  public cleanupSystems(world: ECSWorld): void {
    this.sortSystemsIfNeeded();

    for (const system of this.sortedSystems) {
      if (system.cleanup) {
        system.cleanup(world);
      }
    }
  }

  /**
   * Sort systems by priority if needed
   */
  private sortSystemsIfNeeded(): void {
    if (!this.needsSort) {
      return;
    }

    this.sortedSystems = Array.from(this.systems.values()).sort(
      (a, b) => a.priority - b.priority,
    );

    this.needsSort = false;
  }
}
