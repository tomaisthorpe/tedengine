import type {
  TSerializedMaterial,
  TSerializedMaterialValue,
} from '../renderer/frame-params';
import type { IMaterial } from './material';

export class TShaderMaterial implements IMaterial {
  public type = 'shader';

  public constructor(
    public shader: string,
    public parameters: Record<string, TSerializedMaterialValue> = {},
  ) {}

  public setParameter(name: string, value: TSerializedMaterialValue): void {
    this.parameters[name] = value;
  }

  public serialize(): TSerializedMaterial {
    return {
      type: 'shader',
      shader: this.shader,
      parameters: this.parameters,
    };
  }
}
