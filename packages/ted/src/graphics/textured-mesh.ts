import type TEngine from '../engine/engine';

export default class TTexturedMesh {
  public uuid?: string;

  public async loadMesh(
    engine: TEngine,
    positions: number[],
    normals: number[],
    indexes: number[],
    uvs: number[]
  ): Promise<void> {
    const result = await engine.jobs.do({
      type: 'load_textured_mesh',
      args: [positions, normals, indexes, uvs],
    });

    this.uuid = result;
  }
}
