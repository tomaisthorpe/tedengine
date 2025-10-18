import { TJobContextTypes } from '../jobs/context-types';
import type { TJobManager } from '../jobs/job-manager';
import type { TAudioJobContext, TJobConfig } from '../jobs/jobs';

export const AudioJobLoadSoundFromUrl: TJobConfig<
  TJobContextTypes.Audio,
  string,
  string
> = {
  name: 'load_sound_from_url',
  requiredContext: TJobContextTypes.Audio,
};

export const AudioJobPlaySound: TJobConfig<
  TJobContextTypes.Audio,
  { uuid: string; volume: number; loop: boolean },
  void
> = {
  name: 'play_sound',
  requiredContext: TJobContextTypes.Audio,
};

export const AudioJobSetVolume: TJobConfig<
  TJobContextTypes.Audio,
  { uuid: string; volume: number },
  void
> = {
  name: 'set_volume',
  requiredContext: TJobContextTypes.Audio,
};

export function registerAudioJobs(jobManager: TJobManager) {
  jobManager.registerJob(
    AudioJobLoadSoundFromUrl,
    async (ctx: TAudioJobContext, url: string): Promise<string> => {
      const uuid = await ctx.audio.loadSound(url);
      return uuid;
    },
  );
  jobManager.registerJob(
    AudioJobPlaySound,
    async (
      ctx: TAudioJobContext,
      { uuid, volume, loop }: { uuid: string; volume: number; loop: boolean },
    ) => {
      ctx.audio.play(uuid, volume, loop);
    },
  );
  jobManager.registerJob(
    AudioJobSetVolume,
    async (
      ctx: TAudioJobContext,
      { uuid, volume }: { uuid: string; volume: number },
    ) => {
      ctx.audio.setVolume(uuid, volume);
    },
  );
}
