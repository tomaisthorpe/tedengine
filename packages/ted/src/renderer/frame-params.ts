// TFrameParams is used to tell the rendered how to render a frame.
import type { mat4 } from 'gl-matrix';
import type { TSpriteLayer } from '../actor-components/sprite-component';
import type { TCameraView } from '../cameras/camera-view';

// It must be only made up of only transferable objects.
export interface TFrameParams {
  frameNumber: number;
  renderTasks: TSerializedRenderTask[];
  cameraView: TCameraView;
  projectionMatrix: mat4;
}

export interface TSerializedShader {
  uuid: string;
}

export type TSerializedRenderTask =
  | TSerializedMeshInstance
  | TSerializedSpriteInstance;

export enum TRenderTask {
  MeshInstance = 'mi',
  SpriteInstance = 'si',
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
  material: TSerializedMaterial;
  layer: TSpriteLayer;
}

export interface TSerializedMaterial {
  type: 'color' | 'textured';
  options: any;
}
