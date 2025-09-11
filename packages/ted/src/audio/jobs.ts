import { TJobContextTypes } from '../jobs/context-types';
import TJobManager from '../jobs/job-manager';
import type { TAudioJobContext, TRunJobConfig } from '../jobs/jobs';

export const AudioJobLoadSoundFromUrl: TRunJobConfig<string, string> = {
  name: 'load_sound_from_url',
  requiredContext: TJobContextTypes.Audio,
};

export const AudioJobPlaySound: TRunJobConfig<
  { uuid: string; volume: number },
  void
> = {
  name: 'play_sound',
  requiredContext: TJobContextTypes.Audio,
};

export function registerAudioJobs(jobManager: TJobManager) {
  jobManager.registerJob<TAudioJobContext, string, string>(
    AudioJobLoadSoundFromUrl,
    async (ctx: TAudioJobContext, url: string): Promise<string> => {
      const uuid = await ctx.audio.loadSound(url);
      return uuid;
    },
  );
  jobManager.registerJob<
    TAudioJobContext,
    { uuid: string; volume: number },
    void
  >(
    AudioJobPlaySound,
    async (
      ctx: TAudioJobContext,
      { uuid, volume }: { uuid: string; volume: number },
    ) => {
      ctx.audio.play(uuid, volume);
    },
  );
}
