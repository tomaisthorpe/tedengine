import type TAudio from '../audio/audio';
import type TGameState from '../core/game-state';
import type TResourceManager from '../core/resource-manager';
import type { TPhysicsWorld } from '../physics/physics-world';
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

export type TGameStateJobContext = {
  gameState: TGameState;
};

export type TJobFunc<T, TArgs = unknown, TResult = unknown> = (
  ctx: T,
  args: TArgs,
) => Promise<TResult>;

// Type mapping from context enum to actual context types
export type TContextTypeMap = {
  [TJobContextTypes.Engine]: TJobContext;
  [TJobContextTypes.Renderer]: TRenderJobContext;
  [TJobContextTypes.Audio]: TAudioJobContext;
  [TJobContextTypes.Physics]: TPhysicsJobContext;
  [TJobContextTypes.GameState]: TGameStateJobContext;
};

export interface TJobConfig<
  TContext extends TJobContextTypes = TJobContextTypes,
  TJobArgs = unknown,
  TJobResult = unknown,
> {
  name: string;
  requiredContext: TContext;
  // These phantom types ensure type safety when using the job config
  readonly _jobArgs?: TJobArgs;
  readonly _jobResult?: TJobResult;
  readonly _context?: TContextTypeMap[TContext];
}
