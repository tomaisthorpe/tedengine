import type { IAsset } from '../core/resource-manager';
import type { TSerializedMaterial } from '../renderer/frame-params';
import MTLParser from '../utils/mtl-parser';
import type IMaterial from './material';

export type TColor = [number, number, number, number];
export interface TPalette {
  [key: string]: [number, number, number, number];
}

export default class TColorMaterial implements IAsset, IMaterial {
  public type = 'unknown';

  public palette?: TPalette;

  public async load(response: Response): Promise<void> {
    const source = await response.text();

    this.parseMTL(source);
  }

  private parseMTL(source: string) {
    this.palette = MTLParser.parse(source);
  }

  public serialize(): TSerializedMaterial | undefined {
    if (!this.palette) {
      return undefined;
    }

    return {
      type: 'color',
      options: {
        palette: this.palette,
      },
    };
  }
}
