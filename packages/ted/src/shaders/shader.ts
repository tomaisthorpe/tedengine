import type { IJobAsset } from '../core/resource-manager';
import type TJobManager from '../jobs/job-manager';
import type { TSerializedShader } from '../renderer/frame-params';

export default class TShader implements IJobAsset {
  private uuid?: string;

  public async loadWithJob(jobs: TJobManager, url: string): Promise<void> {
    // We need to trigger a job to load a program
    // This program will then need to run on the renderer thread

    const result = await jobs.do<string>({
      type: 'load_program',
      args: [url],
    });

    this.uuid = result;
  }

  public serialise(): TSerializedShader | undefined {
    if (!this.uuid) {
      return undefined;
    }

    return { uuid: this.uuid };
  }
}
