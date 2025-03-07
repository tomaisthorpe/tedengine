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
 * Serialize a transform component
 * @param data The transform component data
 */
export function serializeTransformComponent(
  data: TransformComponentData,
): unknown {
  return {
    position: Array.from(data.position),
    rotation: Array.from(data.rotation),
    scale: Array.from(data.scale),
    parentEntity: data.parentEntity,
  };
}

/**
 * Deserialize a transform component
 * @param serialized The serialized transform component data
 */
export function deserializeTransformComponent(
  serialized: unknown,
): TransformComponentData {
  const data = serialized as Record<string, unknown>;

  const result: TransformComponentData = {
    position: vec3.create(),
    rotation: quat.create(),
    scale: vec3.fromValues(1, 1, 1),
  };

  if (data.position && Array.isArray(data.position)) {
    vec3.set(
      result.position,
      data.position[0] as number,
      data.position[1] as number,
      data.position[2] as number,
    );
  }

  if (data.rotation && Array.isArray(data.rotation)) {
    quat.set(
      result.rotation,
      data.rotation[0] as number,
      data.rotation[1] as number,
      data.rotation[2] as number,
      data.rotation[3] as number,
    );
  }

  if (data.scale && Array.isArray(data.scale)) {
    vec3.set(
      result.scale,
      data.scale[0] as number,
      data.scale[1] as number,
      data.scale[2] as number,
    );
  }

  if (data.parentEntity) {
    result.parentEntity = data.parentEntity as string;
  }

  return result;
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
