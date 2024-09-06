import type { vec3 } from 'gl-matrix';
import { TJobContextTypes } from '../jobs/context-types';
import type { TJobConfigs, TPhysicsJobContext } from '../jobs/jobs';
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

export interface TPhysicsSimulateStepResult {
  bodies: TPhysicsBody[];
  collisions: TPhysicsCollision[];
  stepElapsedTime: number;
  debug?: TPhysicsWorldDebug;
}

export const PhysicsJobs: TJobConfigs = {
  query_line: {
    requiredContext: TJobContextTypes.Physics,
    func: async (
      ctx: TPhysicsJobContext,
      from: vec3,
      to: vec3,
      options?: TPhysicsQueryOptions,
    ): Promise<TPhysicsQueryLineResult[]> => {
      return ctx.world.queryLine(from, to, options);
    },
  },
  query_area: {
    requiredContext: TJobContextTypes.Physics,
    func: async (
      ctx: TPhysicsJobContext,
      from: vec3,
      to: vec3,
      options?: TPhysicsQueryOptions,
    ): Promise<TPhysicsQueryAreaResult[]> => {
      return ctx.world.queryArea(from, to, options);
    },
  },
  simulate_step: {
    requiredContext: TJobContextTypes.Physics,
    func: async (
      ctx: TPhysicsJobContext,
      delta: number,
      newBodies: TPhysicsRegisterBody[],
      removeBodies: TPhysicsRemoveBody[],
      stateChanges: TPhysicsStateChange[],
      debug?: boolean,
    ): Promise<TPhysicsSimulateStepResult> => {
      const now = performance.now();

      // Remove bodies
      for (const body of removeBodies) {
        ctx.world.removeBody(body.uuid);
      }

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

      const worldState = ctx.world.step(delta, debug);

      return {
        ...worldState,
        stepElapsedTime: performance.now() - now,
      };
    },
  },

  create_world: {
    requiredContext: TJobContextTypes.Physics,
    func: async (
      ctx: TPhysicsJobContext,
      config: TWorldConfig,
    ): Promise<void> => {
      await ctx.world.create(config);
    },
  },
};

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
