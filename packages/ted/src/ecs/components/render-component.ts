import { ComponentData } from '../component-manager';
import type { TSerializedRenderTask } from '../../renderer/frame-params';

export const RENDER_COMPONENT_TYPE = 'render';

/**
 * Render component data
 */
export interface RenderComponentData extends ComponentData {
  visible: boolean;
  renderTaskFactory?: (entityId: string) => TSerializedRenderTask | undefined;
  renderTaskData?: Record<string, unknown>;
}

/**
 * Create a new render component
 */
export function createRenderComponent(): RenderComponentData {
  return {
    visible: true,
  };
}

/**
 * Serialize a render component
 * @param data The render component data
 */
export function serializeRenderComponent(data: RenderComponentData): unknown {
  return {
    visible: data.visible,
    renderTaskData: data.renderTaskData,
  };
}

/**
 * Deserialize a render component
 * @param serialized The serialized render component data
 */
export function deserializeRenderComponent(
  serialized: unknown,
): RenderComponentData {
  const data = serialized as Record<string, unknown>;

  const result: RenderComponentData = {
    visible: true,
  };

  if (data.visible !== undefined) {
    result.visible = data.visible as boolean;
  }

  if (data.renderTaskData) {
    result.renderTaskData = data.renderTaskData as Record<string, unknown>;
  }

  return result;
}
