import type TAudio from '../audio/audio';
import { AudioJobs } from '../audio/jobs';
import type TResourceManager from '../core/resource-manager';
import { PhysicsJobs } from '../physics/jobs';
import type { TPhysicsWorld } from '../physics/physics-world';
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

export type TPhysicsJobContext = {
  world: TPhysicsWorld;
};

export type TJobFunc<T> = (ctx: T, ...args: any[]) => Promise<unknown>;

export interface TJobConfig {
  requiredContext?: TJobContextTypes;
  func:
  | TJobFunc<TJobContext>
  | TJobFunc<TRenderJobContext>
  | TJobFunc<TAudioJobContext>
  | TJobFunc<TPhysicsJobContext>;
}

export interface TJobConfigs {
  [key: string]: TJobConfig;
}

export const GeneralJobs: { [key: string]: TJobConfig } = {
  load_text: {
    func: async (_: TJobContext, text: string) => {
      console.log('text', text);
    },
  },
};

export const AllJobs: TJobConfigs = {
  ...RendererJobs,
  ...AudioJobs,
  ...PhysicsJobs,
};
