import type { TWrappedJob, TWrappedJobResult } from './job-manager';

export enum TMessageTypesJobs {
  RELAY = 'job_relay',
  RELAY_RESULT = 'job_relay_result',
}

export interface TJobsMessageRelay {
  type: TMessageTypesJobs.RELAY;
  wrappedJob: TWrappedJob;
}
export interface TJobsMessageRelayResult {
  type: TMessageTypesJobs.RELAY_RESULT;
  wrappedResult: TWrappedJobResult;
}
