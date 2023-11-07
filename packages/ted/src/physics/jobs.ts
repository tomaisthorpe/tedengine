import type { vec3 } from 'gl-matrix';
import { TJobContextTypes } from '../jobs/context-types';
import type { TJobConfigs, TPhysicsJobContext } from '../jobs/jobs';
import type {
  TPhysicsQueryOptions,
  TPhysicsQueryResult,
} from './physics-world';

export const PhysicsJobs: TJobConfigs = {
  query_line: {
    requiredContext: TJobContextTypes.Physics,
    func: async (
      ctx: TPhysicsJobContext,
      from: vec3,
      to: vec3,
      options?: TPhysicsQueryOptions
    ): Promise<TPhysicsQueryResult[]> => {
      return ctx.world.queryLine(from, to, options);
    },
  },
};
