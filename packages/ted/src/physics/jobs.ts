import type { vec3 } from 'gl-matrix';
import { TJobContextTypes } from '../jobs/context-types';
import type { TPhysicsJobContext, TJobConfig } from '../jobs/jobs';
import type {
  TPhysicsQueryOptions,
  TPhysicsQueryLineResult,
  TPhysicsQueryAreaResult,
  TPhysicsWorld,
  TPhysicsBody,
  TPhysicsCollision,
  TPhysicsWorldDebug,
} from './physics-world';
import type { TWorldConfig } from '../core/world';
import type {
  TPhysicsRegisterBody,
  TPhysicsRemoveBody,
  TPhysicsStateChange,
} from './state-changes';
import { TPhysicsStateChangeType } from './state-changes';
import type TJobManager from '../jobs/job-manager';

export interface TPhysicsSimulateStepResult {
  bodies: TPhysicsBody[];
  collisions: TPhysicsCollision[];
  stepElapsedTime: number;
  debug?: TPhysicsWorldDebug;
}

export const PhysicsJobQueryLine: TJobConfig<
  TJobContextTypes.Physics,
  {
    from: vec3;
    to: vec3;
    options?: TPhysicsQueryOptions;
  },
  TPhysicsQueryLineResult[]
> = {
  name: 'query_line',
  requiredContext: TJobContextTypes.Physics,
};

export const PhysicsJobQueryArea: TJobConfig<
  TJobContextTypes.Physics,
  {
    from: vec3;
    to: vec3;
    options?: TPhysicsQueryOptions;
  },
  TPhysicsQueryAreaResult[]
> = {
  name: 'query_area',
  requiredContext: TJobContextTypes.Physics,
};

export const PhysicsJobCreateWorld: TJobConfig<
  TJobContextTypes.Physics,
  TWorldConfig,
  void
> = {
  name: 'create_world',
  requiredContext: TJobContextTypes.Physics,
};

export const PhysicsJobSimulateStep: TJobConfig<
  TJobContextTypes.Physics,
  {
    delta: number;
    newBodies: TPhysicsRegisterBody[];
    removeBodies: TPhysicsRemoveBody[];
    stateChanges: TPhysicsStateChange[];
    debug?: boolean;
  },
  TPhysicsSimulateStepResult
> = {
  name: 'simulate_step',
  requiredContext: TJobContextTypes.Physics,
};

export function registerPhysicsJobs(jobManager: TJobManager) {
  jobManager.registerJob(
    PhysicsJobQueryLine,
    async (
      ctx: TPhysicsJobContext,
      {
        from,
        to,
        options,
      }: {
        from: vec3;
        to: vec3;
        options?: TPhysicsQueryOptions;
      },
    ): Promise<TPhysicsQueryLineResult[]> => {
      return ctx.world.queryLine(from, to, options);
    },
  );

  jobManager.registerJob(
    PhysicsJobQueryArea,
    async (
      ctx: TPhysicsJobContext,
      {
        from,
        to,
        options,
      }: {
        from: vec3;
        to: vec3;
        options?: TPhysicsQueryOptions;
      },
    ): Promise<TPhysicsQueryAreaResult[]> => {
      return ctx.world.queryArea(from, to, options);
    },
  );

  jobManager.registerJob(
    PhysicsJobSimulateStep,
    async (
      ctx: TPhysicsJobContext,
      {
        delta,
        newBodies,
        removeBodies,
        stateChanges,
        debug,
      }: {
        delta: number;
        newBodies: TPhysicsRegisterBody[];
        removeBodies: TPhysicsRemoveBody[];
        stateChanges: TPhysicsStateChange[];
        debug?: boolean;
      },
    ): Promise<TPhysicsSimulateStepResult> => {
      const now = performance.now();

      // Add new bodies
      for (const body of newBodies) {
        ctx.world.addBody(
          body.uuid,
          body.collider,
          body.translation,
          body.rotation,
          body.options,
        );
      }

      // Apply state changes
      for (const stateChange of stateChanges) {
        applyStateChange(ctx.world, stateChange);
      }

      // Remove bodies last incase they are referenced in the state changes
      for (const body of removeBodies) {
        ctx.world.removeBody(body.uuid);
      }

      const worldState = ctx.world.step(delta, debug);

      return {
        ...worldState,
        stepElapsedTime: performance.now() - now,
      };
    },
  );

  jobManager.registerJob(
    PhysicsJobCreateWorld,
    async (ctx: TPhysicsJobContext, config: TWorldConfig): Promise<void> => {
      await ctx.world.create(config);
    },
  );
}

function applyStateChange(
  world: TPhysicsWorld,
  stateChange: TPhysicsStateChange,
) {
  switch (stateChange.type) {
    case TPhysicsStateChangeType.APPLY_CENTRAL_FORCE:
      world.applyCentralForce(stateChange.uuid, stateChange.force);
      break;
    case TPhysicsStateChangeType.APPLY_CENTRAL_IMPULSE:
      world.applyCentralImpulse(stateChange.uuid, stateChange.impulse);
      break;
    case TPhysicsStateChangeType.UPDATE_BODY_OPTIONS:
      world.updateBodyOptions(stateChange.uuid, stateChange.options);
      break;
    case TPhysicsStateChangeType.UPDATE_TRANSFORM:
      world.updateTransform(
        stateChange.uuid,
        stateChange.translation,
        stateChange.rotation,
      );
      break;
  }
}
