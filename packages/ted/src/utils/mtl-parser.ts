import { MTLFile } from './mtl-file-parser/mtl-file';

export class MTLParser {
  public static parse(content: string): {
    [key: string]: [number, number, number, number];
  } {
    const palette: { [key: string]: [number, number, number, number] } = {};

    const mtl = new MTLFile(content).parse();

    for (const m of mtl) {
      palette[m.name] = [m.Kd.red, m.Kd.green, m.Kd.blue, 1.0];
    }

    return palette;
  }
}
