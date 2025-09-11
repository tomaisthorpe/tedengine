import type { IJobAsset } from '../core/resource-manager';
import type TJobManager from '../jobs/job-manager';
import { AudioJobLoadSoundFromUrl, AudioJobPlaySound } from './jobs';

export default class TSound implements IJobAsset {
  private uuid?: string;
  private jobs?: TJobManager;

  /**
   * Volume which the sound will play within [0, 1] range
   */
  public volume = 1.0;

  // @todo look at AudioBuffers
  public async loadWithJob(jobs: TJobManager, url: string): Promise<void> {
    const result = await jobs.do(AudioJobLoadSoundFromUrl, url);

    this.uuid = result;
    this.jobs = jobs;
  }

  public play() {
    if (!this.uuid || !this.jobs) return;

    this.jobs.do(AudioJobPlaySound, {
      uuid: this.uuid,
      volume: this.volume,
    });
  }
}
