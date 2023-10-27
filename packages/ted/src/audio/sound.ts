import type { IJobAsset } from '../core/resource-manager';
import type TJobManager from '../jobs/job-manager';

export default class TSound implements IJobAsset {
  private uuid?: string;
  private jobs?: TJobManager;

  /**
   * Volume which the sound will play within [0, 1] range
   */
  public volume = 1.0;

  // @todo look at AudioBuffers
  public async loadWithJob(jobs: TJobManager, url: string): Promise<void> {
    const result = await jobs.do({
      type: 'load_sound_from_url',
      args: [url],
    });

    this.uuid = result;
    this.jobs = jobs;
  }

  public play() {
    if (!this.uuid || !this.jobs) return;

    this.jobs.do({
      type: 'play_sound',
      args: [this.uuid, this.volume],
    });
  }
}
