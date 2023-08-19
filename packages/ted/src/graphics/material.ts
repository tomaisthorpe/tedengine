import type { TSerializedMaterial } from '../renderer/frame-params';

export interface IMaterial {
  type: string;
  serialize(): TSerializedMaterial | undefined;
}
