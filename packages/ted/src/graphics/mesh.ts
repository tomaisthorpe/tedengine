import type { IJobAsset } from '../core/resource-manager';
import type TEngine from '../engine/engine';
import type TJobManager from '../jobs/job-manager';
import type { TPaletteIndex } from '../renderer/renderable-mesh';

export default class TMesh implements IJobAsset {
  public uuid?: string;

  public async loadWithJob(jobs: TJobManager, url: string): Promise<void> {
    // Load the mesh on the renderer thread
    const result = await jobs.do({
      type: 'load_mesh_from_url',
      args: [url],
    });

    this.uuid = result;
  }

  public async loadMesh(
    engine: TEngine,
    positions: number[],
    normals: number[],
    indexes: number[],
    colors: number[],
    palette: TPaletteIndex
  ): Promise<void> {
    const result = await engine.jobs.do({
      type: 'load_mesh',
      args: [positions, normals, indexes, colors, palette],
    });

    this.uuid = result;
  }
}
