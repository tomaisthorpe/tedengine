import type TAudio from '../audio/audio';
import type TGameState from '../core/game-state';
import type TResourceManager from '../core/resource-manager';
import type { TPhysicsWorld } from '../physics/physics-world';
import type TRenderer from '../renderer/renderer';
import { TJobContextTypes } from './context-types';

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

export type TGameStateJobContext = {
  gameState: TGameState;
};

export type TJobFunc<T, TArgs = unknown, TResult = unknown> = (
  ctx: T,
  args: TArgs,
) => Promise<TResult>;

export interface TJobConfig<TJobArgs = unknown, TJobResult = unknown>
  extends TRunJobConfig<TJobArgs, TJobResult> {
  func:
    | TJobFunc<TJobContext>
    | TJobFunc<TRenderJobContext>
    | TJobFunc<TAudioJobContext>
    | TJobFunc<TPhysicsJobContext>
    | TJobFunc<TGameStateJobContext>;
}

export interface TRunJobConfig<TJobArgs = unknown, TJobResult = unknown> {
  name: string;
  requiredContext: TJobContextTypes;
}

export const TestingJob: TRunJobConfig<string, string> = {
  name: 'testing',
  requiredContext: TJobContextTypes.Engine,
};
