import { v4 as uuidv4 } from 'uuid';
import { TJobContextTypes } from './context-types';
import type {
  TAudioJobContext,
  TJobContext,
  TPhysicsJobContext,
  TRenderJobContext,
} from './jobs';
import { AllJobs } from './jobs';
import type { TJobsMessageRelay, TJobsMessageRelayResult } from './messages';
import { TMessageTypesJobs } from './messages';

export interface TJob {
  type: string;
  args?: any[];
}

export interface TWrappedJob {
  uuid: string;
  job: TJob;
  transferList: Transferable[];
}

export interface TWrappedJobResult {
  uuid: string;
  result: any;
}

export type TJobRelay = (job: TWrappedJob) => void;

export default class TJobManager {
  private relays: { [key: string]: TJobRelay } = {};
  private canProcess: { [key: string]: boolean } = {};

  private relayedJobs: { [key: string]: (_: any) => void } = {};

  public additionalContext!:
    | TJobContext
    | TRenderJobContext
    | TAudioJobContext
    | TPhysicsJobContext;

  constructor(contexts: TJobContextTypes[]) {
    for (const context of contexts) {
      this.canProcess[context] = true;
    }
  }

  /**
   * Set relay function for the specified job contexts.
   * The relay function sends a message containing the wrapped job to the specified message port.
   * If a relay function already exists for a given context, it will be replaced.
   *
   * @param contexts - An array of job contexts.
   * @param port - The message port to which the relay function will send the message.
   */
  setRelay(contexts: TJobContextTypes[], port: MessagePort) {
    const func = (wrappedJob: TWrappedJob) => {
      const message: TJobsMessageRelay = {
        type: TMessageTypesJobs.RELAY,
        wrappedJob,
      };
      port.postMessage(message, wrappedJob.transferList || []);
    };

    for (const context of contexts) {
      this.relays[context] = func;
    }
  }

  // @todo jobs don't currently ever reject
  public do(job: TJob, transferList: Transferable[] = []): Promise<any> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      // Check if we can process this job
      const config = AllJobs[job.type];

      const args = job.args || [];

      if (this.canProcess[config.requiredContext || TJobContextTypes.Engine]) {
        // TODO sort this typing using generics instead
        const func = config.func as any;
        const result = await func.call(this, this.additionalContext, ...args);
        resolve(result);
        return;
      }

      const uuid = uuidv4();
      this.relayedJobs[uuid] = resolve;

      // If we can't process it, then it needs to be handled by another worker
      this.relays[config.requiredContext || TJobContextTypes.Engine]({
        uuid,
        job,
        transferList,
      });
    });
  }

  public async doRelayedJob(
    wrappedJob: TWrappedJob,
    port: {
      postMessage: (result: TJobsMessageRelayResult) => void;
    }
  ) {
    const result = await this.do(wrappedJob.job, []);

    const wrappedResult: TWrappedJobResult = {
      uuid: wrappedJob.uuid,
      result,
    };

    const message: TJobsMessageRelayResult = {
      type: TMessageTypesJobs.RELAY_RESULT,
      wrappedResult,
    };

    port.postMessage(message);
  }

  public onRelayedResult(wrappedResult: TWrappedJobResult) {
    this.relayedJobs[wrappedResult.uuid](wrappedResult.result);
    delete this.relayedJobs[wrappedResult.uuid];
  }
}
