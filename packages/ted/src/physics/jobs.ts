import type { vec3 } from 'gl-matrix';
import { TJobContextTypes } from '../jobs/context-types';
import type { TJobConfigs, TPhysicsJobContext } from '../jobs/jobs';
import type {
  TPhysicsQueryOptions,
  TPhysicsQueryLineResult,
  TPhysicsQueryAreaResult,
} from './physics-world';

export const PhysicsJobs: TJobConfigs = {
  query_line: {
    requiredContext: TJobContextTypes.Physics,
    func: async (
      ctx: TPhysicsJobContext,
      from: vec3,
      to: vec3,
      options?: TPhysicsQueryOptions
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
      options?: TPhysicsQueryOptions
    ): Promise<TPhysicsQueryAreaResult[]> => {
      return ctx.world.queryArea(from, to, options);
    },
  },
};
