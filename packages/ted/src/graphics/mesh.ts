import type { IJobAsset } from '../core/resource-manager';
import type { TEngine } from '../engine/engine';
import type { TJobManager } from '../jobs/job-manager';
import {
  RendererJobLoadMesh,
  RendererJobLoadMeshFromUrl,
} from '../renderer/jobs';
import type { TPaletteIndex } from '../renderer/renderable-mesh';

export class TMesh implements IJobAsset {
  public uuid?: string;

  public async loadWithJob(jobs: TJobManager, url: string): Promise<void> {
    // Load the mesh on the renderer thread
    const result = await jobs.do(RendererJobLoadMeshFromUrl, url);

    this.uuid = result;
  }

  public async loadMesh(
    engine: TEngine,
    positions: number[],
    normals: number[],
    indexes: number[],
    colors: number[],
    paletteIndex: TPaletteIndex,
  ): Promise<void> {
    const result = await engine.jobs.do(RendererJobLoadMesh, {
      positions,
      normals,
      indexes,
      colors,
      paletteIndex,
    });

    this.uuid = result;
  }
}
