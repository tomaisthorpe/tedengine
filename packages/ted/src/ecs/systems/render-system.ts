import type { System } from '../system-manager';
import type { ECSWorld } from '../world';
import type { EntityId } from '../entity-manager';
import {
  RENDER_COMPONENT_TYPE,
  type RenderComponentData,
} from '../components/render-component';
import { TRANSFORM_COMPONENT_TYPE } from '../components/transform-component';
import { TRANSFORM_SYSTEM_ID, type TransformSystem } from './transform-system';
import type { TSerializedRenderTask } from '../../renderer/frame-params';

/**
 * System ID for the render system
 */
export const RENDER_SYSTEM_ID = 'render';

/**
 * Render system - handles rendering entities
 */
export const RenderSystem: System = {
  id: RENDER_SYSTEM_ID,
  name: 'Render System',
  requiredComponents: [RENDER_COMPONENT_TYPE, TRANSFORM_COMPONENT_TYPE],
  priority: 100, // Run after transform system

  initialize(world: ECSWorld): void {
    // Nothing to initialize
  },

  update(world: ECSWorld, entities: EntityId[], delta: number): void {
    // Nothing to do in update, rendering is handled separately
  },

  /**
   * Get render tasks for all renderable entities
   * @param world The ECS world
   */
  getRenderTasks(world: ECSWorld): TSerializedRenderTask[] {
    const tasks: TSerializedRenderTask[] = [];
    const transformSystem = world
      .getSystemManager()
      .getSystem(TRANSFORM_SYSTEM_ID) as typeof TransformSystem;

    // Get all entities with render and transform components
    const entities = world.getEntitiesWithComponents([
      RENDER_COMPONENT_TYPE,
      TRANSFORM_COMPONENT_TYPE,
    ]);

    for (const entityId of entities) {
      const renderComponent = world.getComponent<RenderComponentData>(
        entityId,
        RENDER_COMPONENT_TYPE,
      );

      if (!renderComponent || !renderComponent.visible) {
        continue;
      }

      // Get world transform matrix
      const worldMatrix = transformSystem.getWorldMatrix(entityId);
      if (!worldMatrix) {
        continue;
      }

      // If the component has a render task factory, use it to create a render task
      if (renderComponent.renderTaskFactory) {
        const task = renderComponent.renderTaskFactory(entityId);
        if (task) {
          // Apply world transform to the task
          task.transform = Array.from(worldMatrix);
          tasks.push(task);
        }
      }
    }

    return tasks;
  },

  cleanup(world: ECSWorld): void {
    // Nothing to clean up
  },
};
