import type TEngine from '../engine/engine';
import type { IJobAsset } from '../core/resource-manager';
import type TJobManager from '../jobs/job-manager';
import {
  RendererJobLoadTexturedMesh,
  RendererJobLoadTexturedMeshFromUrl,
} from '../renderer/jobs';

export default class TTexturedMesh implements IJobAsset {
  public uuid?: string;

  public async loadWithJob(jobs: TJobManager, url: string): Promise<void> {
    // Load the mesh on the renderer thread
    const result = await jobs.do(RendererJobLoadTexturedMeshFromUrl, url);

    this.uuid = result;
  }

  public async loadMesh(
    engine: TEngine,
    positions: number[],
    normals: number[],
    indexes: number[],
    uvs: number[],
  ): Promise<void> {
    const result = await engine.jobs.do(RendererJobLoadTexturedMesh, {
      positions,
      normals,
      indexes,
      uvs,
    });

    this.uuid = result;
  }
}
