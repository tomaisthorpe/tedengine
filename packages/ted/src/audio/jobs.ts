import { TJobContextTypes } from '../jobs/context-types';
import type { TJobConfigs, TAudioJobContext } from '../jobs/jobs';

export const AudioJobs: TJobConfigs = {
  load_sound_from_url: {
    requiredContext: TJobContextTypes.Audio,
    func: async (ctx: TAudioJobContext, url: string): Promise<string> => {
      const uuid = await ctx.audio.loadSound(url);

      return uuid;
    },
  },
  play_sound: {
    requiredContext: TJobContextTypes.Audio,
    func: async (ctx: TAudioJobContext, uuid: string, volume: number) => {
      ctx.audio.play(uuid, volume);
    },
  },
};
