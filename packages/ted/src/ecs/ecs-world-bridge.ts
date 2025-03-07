import type TEngine from '../engine/engine';
import type TWorld from '../core/world';
import type TActor from '../core/actor';
import type TSceneComponent from '../actor-components/scene-component';
import { ECSWorld } from './world';
import { ComponentRegistry } from './component-registry';
import { SystemRegistry } from './system-registry';
import {
  TRANSFORM_COMPONENT_TYPE,
  type TransformComponentData,
} from './components/transform-component';
import {
  RENDER_COMPONENT_TYPE,
  type RenderComponentData,
} from './components/render-component';
import {
  PHYSICS_COMPONENT_TYPE,
  type PhysicsComponentData,
} from './components/physics-component';
import { RENDER_SYSTEM_ID } from './systems/render-system';
import type { TSerializedRenderTask } from '../renderer/frame-params';
import { vec3, quat } from 'gl-matrix';

/**
 * Bridge between the ECS world and the existing engine
 */
export class ECSWorldBridge {
  private ecsWorld: ECSWorld;
  private engine: TEngine;
  private tedWorld?: TWorld;

  // Maps to track relationships between old and new architecture
  private actorToEntityMap: Map<string, string> = new Map();
  private entityToActorMap: Map<string, string> = new Map();
  private componentToEntityMap: Map<string, string> = new Map();

  constructor(engine: TEngine) {
    this.engine = engine;
    this.ecsWorld = new ECSWorld(engine);

    // Register component types
    const componentRegistry = ComponentRegistry.getInstance();
    for (const componentType of componentRegistry.getAllComponentTypes()) {
      this.ecsWorld.getComponentManager().registerComponentType(componentType);
    }

    // Register systems
    const systemRegistry = SystemRegistry.getInstance();
    for (const system of systemRegistry.getAllSystems()) {
      this.ecsWorld.registerSystem(system);
    }

    // Initialize systems
    this.ecsWorld.initializeSystems();
  }

  /**
   * Get the ECS world
   */
  public getECSWorld(): ECSWorld {
    return this.ecsWorld;
  }

  /**
   * Set the TED world
   * @param world The TED world
   */
  public setTEDWorld(world: TWorld): void {
    this.tedWorld = world;
  }

  /**
   * Update the ECS world
   * @param delta Time since last update
   */
  public update(delta: number): void {
    // Update the ECS world
    this.ecsWorld.update(delta);
  }

  /**
   * Get render tasks from the ECS world
   */
  public getRenderTasks(): TSerializedRenderTask[] {
    const renderSystem = this.ecsWorld
      .getSystemManager()
      .getSystem(RENDER_SYSTEM_ID) as any;
    if (!renderSystem || !renderSystem.getRenderTasks) {
      return [];
    }

    return renderSystem.getRenderTasks(this.ecsWorld);
  }

  /**
   * Convert an actor to an entity
   * @param actor The actor to convert
   */
  public convertActorToEntity(actor: TActor): string {
    // Check if the actor has already been converted
    if (this.actorToEntityMap.has(actor.uuid)) {
      return this.actorToEntityMap.get(actor.uuid)!;
    }

    // Create a new entity
    const entityId = this.ecsWorld.createEntity(actor.constructor.name);

    // Store the mapping
    this.actorToEntityMap.set(actor.uuid, entityId);
    this.entityToActorMap.set(entityId, actor.uuid);

    // Add transform component
    const transformComponent: TransformComponentData = {
      position: vec3.create(),
      rotation: quat.create(),
      scale: vec3.fromValues(1, 1, 1),
    };

    // Copy transform from root component
    if (actor.rootComponent) {
      const rootTransform = actor.rootComponent.transform;
      vec3.copy(transformComponent.position, rootTransform.position);
      quat.copy(transformComponent.rotation, rootTransform.rotation);
      vec3.copy(transformComponent.scale, rootTransform.scale);
    }

    this.ecsWorld.addComponent(
      entityId,
      TRANSFORM_COMPONENT_TYPE,
      transformComponent,
    );

    // Add render component if the actor has renderable components
    const renderableTasks = actor.getRenderTasks();
    if (renderableTasks.length > 0) {
      const renderComponent: RenderComponentData = {
        visible: true,
        renderTaskFactory: () => renderableTasks[0], // Simplified, just use the first task
      };

      this.ecsWorld.addComponent(
        entityId,
        RENDER_COMPONENT_TYPE,
        renderComponent,
      );
    }

    // Add physics component if the actor has a physics body
    if (actor.rootComponent.collider) {
      const physicsComponent: PhysicsComponentData = {
        bodyOptions: { ...actor.rootComponent.bodyOptions },
        collider: actor.rootComponent.collider,
        collisionClass: 'Solid', // Default
      };

      this.ecsWorld.addComponent(
        entityId,
        PHYSICS_COMPONENT_TYPE,
        physicsComponent,
      );
    }

    // Convert child components
    for (const component of actor.components) {
      if (component !== actor.rootComponent) {
        this.convertComponentToEntity(component, entityId);
      }
    }

    return entityId;
  }

  /**
   * Convert a component to an entity
   * @param component The component to convert
   * @param parentEntityId The parent entity ID
   */
  private convertComponentToEntity(
    component: TSceneComponent,
    parentEntityId: string,
  ): string {
    // Check if the component has already been converted
    if (this.componentToEntityMap.has(component.uuid)) {
      return this.componentToEntityMap.get(component.uuid)!;
    }

    // Create a new entity
    const entityId = this.ecsWorld.createEntity(component.constructor.name);

    // Store the mapping
    this.componentToEntityMap.set(component.uuid, entityId);

    // Add transform component
    const transformComponent: TransformComponentData = {
      position: vec3.create(),
      rotation: quat.create(),
      scale: vec3.fromValues(1, 1, 1),
      parentEntity: parentEntityId,
    };

    // Copy transform
    vec3.copy(transformComponent.position, component.transform.position);
    quat.copy(transformComponent.rotation, component.transform.rotation);
    vec3.copy(transformComponent.scale, component.transform.scale);

    this.ecsWorld.addComponent(
      entityId,
      TRANSFORM_COMPONENT_TYPE,
      transformComponent,
    );

    // Add render component if the component is renderable
    if (component.canRender && component.shouldRender) {
      const renderTask = component.getRenderTask();
      if (renderTask) {
        const renderComponent: RenderComponentData = {
          visible: true,
          renderTaskFactory: () => renderTask,
        };

        this.ecsWorld.addComponent(
          entityId,
          RENDER_COMPONENT_TYPE,
          renderComponent,
        );
      }
    }

    // Add physics component if the component has a collider
    if (component.collider) {
      const physicsComponent: PhysicsComponentData = {
        bodyOptions: { ...component.bodyOptions },
        collider: component.collider,
      };

      this.ecsWorld.addComponent(
        entityId,
        PHYSICS_COMPONENT_TYPE,
        physicsComponent,
      );
    }

    return entityId;
  }

  /**
   * Convert all actors in the TED world to entities
   */
  public convertWorldToECS(): void {
    if (!this.tedWorld) {
      return;
    }

    for (const actor of this.tedWorld.actors) {
      this.convertActorToEntity(actor);
    }
  }

  /**
   * Serialize the ECS world
   */
  public serialize(): Record<string, unknown> {
    return this.ecsWorld.serialize();
  }

  /**
   * Deserialize the ECS world
   * @param serialized The serialized world data
   */
  public deserialize(serialized: Record<string, unknown>): void {
    this.ecsWorld.deserialize(serialized);
  }
}
