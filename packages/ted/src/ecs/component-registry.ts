import { ComponentType, ComponentTypeId } from './component-manager';
import {
  TRANSFORM_COMPONENT_TYPE,
  createTransformComponent,
  serializeTransformComponent,
  deserializeTransformComponent,
} from './components/transform-component';
import {
  RENDER_COMPONENT_TYPE,
  createRenderComponent,
  serializeRenderComponent,
  deserializeRenderComponent,
} from './components/render-component';
import {
  PHYSICS_COMPONENT_TYPE,
  createPhysicsComponent,
  serializePhysicsComponent,
  deserializePhysicsComponent,
} from './components/physics-component';

/**
 * Registry of component types
 */
export class ComponentRegistry {
  private static instance: ComponentRegistry;
  private componentTypes: Map<ComponentTypeId, ComponentType<any>> = new Map();

  /**
   * Get the singleton instance
   */
  public static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
      ComponentRegistry.instance.registerBuiltInComponents();
    }

    return ComponentRegistry.instance;
  }

  /**
   * Register a component type
   * @param componentType The component type to register
   */
  public registerComponentType<T>(componentType: ComponentType<T>): void {
    if (this.componentTypes.has(componentType.id)) {
      throw new Error(
        `Component type ${componentType.id} is already registered`,
      );
    }

    this.componentTypes.set(componentType.id, componentType);
  }

  /**
   * Get a component type
   * @param typeId The component type ID
   */
  public getComponentType<T>(
    typeId: ComponentTypeId,
  ): ComponentType<T> | undefined {
    return this.componentTypes.get(typeId) as ComponentType<T> | undefined;
  }

  /**
   * Get all registered component types
   */
  public getAllComponentTypes(): ComponentType<any>[] {
    return Array.from(this.componentTypes.values());
  }

  /**
   * Register built-in component types
   */
  private registerBuiltInComponents(): void {
    // Register transform component
    this.registerComponentType({
      id: TRANSFORM_COMPONENT_TYPE,
      name: 'Transform',
      create: createTransformComponent,
      serialize: serializeTransformComponent,
      deserialize: deserializeTransformComponent,
    });

    // Register render component
    this.registerComponentType({
      id: RENDER_COMPONENT_TYPE,
      name: 'Render',
      create: createRenderComponent,
      serialize: serializeRenderComponent,
      deserialize: deserializeRenderComponent,
    });

    // Register physics component
    this.registerComponentType({
      id: PHYSICS_COMPONENT_TYPE,
      name: 'Physics',
      create: createPhysicsComponent,
      serialize: serializePhysicsComponent,
      deserialize: deserializePhysicsComponent,
    });
  }
}
