import { System, SystemId } from './system-manager';
import {
  TransformSystem,
  TRANSFORM_SYSTEM_ID,
} from './systems/transform-system';
import { RenderSystem, RENDER_SYSTEM_ID } from './systems/render-system';
import { PhysicsSystem, PHYSICS_SYSTEM_ID } from './systems/physics-system';

/**
 * Registry of systems
 */
export class SystemRegistry {
  private static instance: SystemRegistry;
  private systems: Map<SystemId, System> = new Map();

  /**
   * Get the singleton instance
   */
  public static getInstance(): SystemRegistry {
    if (!SystemRegistry.instance) {
      SystemRegistry.instance = new SystemRegistry();
      SystemRegistry.instance.registerBuiltInSystems();
    }

    return SystemRegistry.instance;
  }

  /**
   * Register a system
   * @param system The system to register
   */
  public registerSystem(system: System): void {
    if (this.systems.has(system.id)) {
      throw new Error(`System ${system.id} is already registered`);
    }

    this.systems.set(system.id, system);
  }

  /**
   * Get a system
   * @param systemId The system ID
   */
  public getSystem(systemId: SystemId): System | undefined {
    return this.systems.get(systemId);
  }

  /**
   * Get all registered systems
   */
  public getAllSystems(): System[] {
    return Array.from(this.systems.values());
  }

  /**
   * Register built-in systems
   */
  private registerBuiltInSystems(): void {
    // Register transform system
    this.registerSystem(TransformSystem);

    // Register render system
    this.registerSystem(RenderSystem);

    // Register physics system
    this.registerSystem(PhysicsSystem);
  }
}
