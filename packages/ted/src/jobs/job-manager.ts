import { v4 as uuidv4 } from 'uuid';
import { TJobContextTypes } from './context-types';
import type {
  TAudioJobContext,
  TGameStateJobContext,
  TJobContext,
  TJobFunc,
  TPhysicsJobContext,
  TRenderJobContext,
} from './jobs';
import { AllJobs } from './jobs';
import type { TJobsMessageRelay, TJobsMessageRelayResult } from './messages';
import { TMessageTypesJobs } from './messages';

export interface TJob {
  type: string;
  args?: unknown[];
}

export interface TWrappedJob {
  uuid: string;
  job: TJob;
  transferList: Transferable[];
}

export interface TWrappedJobResult {
  uuid: string;
  result: unknown;
}

export type TJobRelay = (
  job: TJob,
  transferList: Transferable[],
) => Promise<unknown>;

export interface TJobProcessor {
  do: (job: TJob, transferList: Transferable[]) => Promise<unknown>;
}

export default class TJobManager {
  private relays: { [key: string]: TJobRelay } = {};
  private canProcess: { [key: string]: boolean } = {};

  private relayedJobs: { [key: string]: (_: any) => void } = {};

  public additionalContext!:
    | TJobContext
    | TRenderJobContext
    | TAudioJobContext
    | TPhysicsJobContext
    | TGameStateJobContext;

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
   * @param portOrManager - The message port or job manager to which the relay function will send the message.
   */
  setRelay(
    contexts: TJobContextTypes[],
    portOrManager: MessagePort | (() => TJobProcessor),
  ) {
    if (portOrManager instanceof MessagePort) {
      const func = (
        job: TJob,
        transferList: Transferable[],
      ): Promise<unknown> => {
        return new Promise((resolve) => {
          const message: TJobsMessageRelay = {
            type: TMessageTypesJobs.RELAY,
            wrappedJob: {
              uuid: uuidv4(),
              job,
              transferList,
            },
          };
          this.relayedJobs[message.wrappedJob.uuid] = resolve;

          portOrManager.postMessage(
            message,
            message.wrappedJob.transferList || [],
          );
        });
      };

      for (const context of contexts) {
        this.relays[context] = func;
      }
    } else {
      const func = (
        job: TJob,
        transferList: Transferable[],
      ): Promise<unknown> => {
        return portOrManager().do(job, transferList || []);
      };

      for (const context of contexts) {
        this.relays[context] = func;
      }
    }
  }

  // @todo jobs don't currently ever reject
  public do<T>(job: TJob, transferList: Transferable[] = []): Promise<T> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      // Check if we can process this job
      const config = AllJobs[job.type];

      const args = job.args || [];

      // First check if we can process the job.
      // If required context is not set, it's an engine job
      if (this.canProcess[config.requiredContext || TJobContextTypes.Engine]) {
        // TODO sort this typing using generics instead
        const func = config.func as TJobFunc<typeof this.additionalContext>;
        const result = await func.call(this, this.additionalContext, ...args);
        resolve(result as T);
        return;
      }

      // If we can't process it, then check if we have a registered relay for it
      if (this.relays[config.requiredContext || TJobContextTypes.Engine]) {
        resolve(
          (await this.relays[config.requiredContext || TJobContextTypes.Engine](
            job,
            transferList,
          )) as T,
        );

        return;
      }

      reject(new Error(`Job ${job.type} cannot be processed`));
    });
  }

  public async doRelayedJob(
    wrappedJob: TWrappedJob,
    port: {
      postMessage: (result: TJobsMessageRelayResult) => void;
    },
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
