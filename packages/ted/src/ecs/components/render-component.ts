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
