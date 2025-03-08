import { vec3, quat, mat4 } from 'gl-matrix';
import { ComponentData } from '../component-manager';

export const TRANSFORM_COMPONENT_TYPE = 'transform';

/**
 * Transform component data
 */
export interface TransformComponentData extends ComponentData {
  position: vec3;
  rotation: quat;
  scale: vec3;
  parentEntity?: string;
}

/**
 * Create a new transform component
 */
export function createTransformComponent(): TransformComponentData {
  return {
    position: vec3.create(),
    rotation: quat.create(),
    scale: vec3.fromValues(1, 1, 1),
  };
}

/**
 * Get the local transform matrix for a transform component
 * @param transform The transform component data
 */
export function getLocalTransformMatrix(
  transform: TransformComponentData,
): mat4 {
  const matrix = mat4.create();

  mat4.fromRotationTranslationScale(
    matrix,
    transform.rotation,
    transform.position,
    transform.scale,
  );

  return matrix;
}
