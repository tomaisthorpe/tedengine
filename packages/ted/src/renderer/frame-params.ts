// TFrameParams is used to tell the rendered how to render a frame.
import type { mat4, vec4, vec2, vec3 } from 'gl-matrix';
import type { TSpriteLayer } from '../actor-components/sprite-component';
import type { TCameraView } from '../cameras/camera-view';
import type { TPalette } from '../graphics/color-material';

// It must be only made up of only transferable objects.
export interface TFrameParams {
  frameNumber: number;
  lighting: TSerializedLighting;
  renderTasks: TSerializedRenderTask[];
  cameraView: TCameraView;
  projectionMatrix: mat4;
}

export interface TSerializedShader {
  uuid: string;
}

export interface TSerializedLighting {
  shadows?: {
    enabled?: boolean;
  };
  ambientLight?: {
    intensity: number;
    color?: vec3;
  };
  directionalLight?: {
    direction: vec3;
    intensity: number;
    color?: vec3;
  };
}

export type TSerializedRenderTask =
  | TSerializedMeshInstance
  | TSerializedSpriteInstance
  | TSerializedSpriteInstances
  | TSerializedPhysicsDebug;

export enum TRenderTask {
  MeshInstance = 'mi',
  SpriteInstance = 'si',
  SpriteInstances = 'sis',
  PhysicsDebug = 'pd',
}

export interface TSerializedMeshInstance {
  type: TRenderTask.MeshInstance;
  uuid: string;
  transform: mat4;
  material: TSerializedMaterial;
}

export interface TSerializedSpriteInstance {
  type: TRenderTask.SpriteInstance;
  uuid: string;
  transform: mat4;
  material: TSerializedTexturedMaterial;
  layer: TSpriteLayer;
}

export interface TSerializedSpriteInstances {
  type: TRenderTask.SpriteInstances;
  uuid: string;
  instances: {
    transform: mat4;
    material?: TSerializedTexturedMaterial;
  }[];
  material: TSerializedTexturedMaterial;
  layer: TSpriteLayer;
}

export interface TSerializedPhysicsDebug {
  type: TRenderTask.PhysicsDebug;
  uuid: string;
  vertices: Float32Array;
  colors: Float32Array;
}

export type TSerializedMaterial =
  | TSerializedColorMaterial
  | TSerializedTexturedMaterial;

export interface TSerializedColorMaterial {
  type: 'color';
  options: {
    palette: TPalette;
  };
}

export interface TSerializedTexturedMaterial {
  type: 'textured';
  options: {
    texture: string;
    instanceUVs?: number[];
    instanceUVScales?: vec2;
    colorFilter?: vec4;
  };
}
