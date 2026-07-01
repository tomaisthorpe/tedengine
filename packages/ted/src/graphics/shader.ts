import type { TJobManager } from '../jobs/job-manager';
import { RendererJobLoadShader } from '../renderer/jobs';
import type { TShaderProgramDescriptor } from '../renderer/program';

export class TShader {
  public uuid?: string;

  public async loadWithJob(
    jobs: TJobManager,
    descriptor: TShaderProgramDescriptor,
  ): Promise<void> {
    this.uuid = await jobs.do(RendererJobLoadShader, descriptor);
  }
}

export type { TShaderProgramDescriptor };
