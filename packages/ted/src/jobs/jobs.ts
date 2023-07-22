import type TAudio from '../audio/audio';
import { AudioJobs } from '../audio/jobs';
import type TResourceManager from '../core/resource-manager';
import { RendererJobs } from '../renderer/jobs';
import type TRenderer from '../renderer/renderer';
import type { TJobContextTypes } from './context-types';

export interface TJobContext {
  resourceManager: TResourceManager;
}

export type TRenderJobContext = TJobContext & {
  renderer: TRenderer;
};

export type TAudioJobContext = TJobContext & {
  audio: TAudio;
};

export interface TJobConfig {
  requiredContext?: TJobContextTypes;
  func:
    | ((ctx: TJobContext, ...args: any) => Promise<any>)
    | ((ctx: TRenderJobContext, ...args: any) => Promise<any>)
    | ((ctx: TAudioJobContext, ...args: any) => Promise<any>);
}

export interface TJobConfigs {
  [key: string]: TJobConfig;
}

export const GeneralJobs: { [key: string]: TJobConfig } = {
  load_text: {
    func: async (ctx: TJobContext, text: string) => {
      console.log('text', text);
    },
  },
};

export const AllJobs: TJobConfigs = {
  ...RendererJobs,
  ...AudioJobs,
};
