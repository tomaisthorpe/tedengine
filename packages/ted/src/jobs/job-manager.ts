import { v4 as uuidv4 } from 'uuid';
import type { TJobContextTypes } from './context-types';
import type {
  TAudioJobContext,
  TContextTypeMap,
  TGameStateJobContext,
  TJobContext,
  TJobFunc,
  TPhysicsJobContext,
  TRenderJobContext,
  TJobConfig,
} from './jobs';
import type { TJobsMessageRelay, TJobsMessageRelayResult } from './messages';
import { TMessageTypesJobs } from './messages';

export interface TJob<TJobArgs = unknown> {
  type: string;
  args?: TJobArgs;
}

export interface TWrappedJob<TJobArgs = unknown> {
  uuid: string;
  job: TJobConfig<TJobContextTypes, TJobArgs>;
  args: TJobArgs;
  transferList: Transferable[];
}

export interface TWrappedJobResult {
  uuid: string;
  result: unknown;
}

export type TJobRelay<TJobArgs = unknown> = (
  job: TJobConfig<TJobContextTypes, TJobArgs, unknown>,
  args: TJobArgs,
  transferList: Transferable[],
) => Promise<unknown>;

export interface TJobProcessor {
  do: (
    job: TJobConfig<TJobContextTypes, unknown, unknown>,
    args: unknown,
    transferList: Transferable[],
  ) => Promise<unknown>;
}

export class TJobManager {
  private relays: { [key: string]: TJobRelay } = {};
  private canProcess: { [key: string]: boolean } = {};

  // Job functions stored with unknown types as each job has its own specific signature
  // Type safety is enforced at registration and retrieval time
  private jobs: Record<string, (ctx: unknown, args: unknown) => Promise<unknown>> = {};

  // Resolve functions for jobs awaiting relay results
  private relayedJobs: { [key: string]: (result: unknown) => void } = {};

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

  registerJob<
    TContext extends TJobContextTypes = TJobContextTypes,
    TJobArgs = unknown,
    TJobResult = unknown,
  >(
    config: TJobConfig<TContext, TJobArgs, TJobResult>,
    func: TJobFunc<TContextTypeMap[TContext], TJobArgs, TJobResult>,
  ) {
    // Store with unknown signature - type safety is maintained at call sites
    this.jobs[config.name] = func as (ctx: unknown, args: unknown) => Promise<unknown>;
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
        job: TJobConfig,
        args: unknown,
        transferList: Transferable[],
      ): Promise<unknown> => {
        return new Promise((resolve) => {
          const message: TJobsMessageRelay = {
            type: TMessageTypesJobs.RELAY,
            wrappedJob: {
              uuid: uuidv4(),
              job,
              args,
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
        job: TJobConfig<TJobContextTypes, unknown, unknown>,
        args: unknown,
        transferList: Transferable[],
      ): Promise<unknown> => {
        return portOrManager().do(job, args, transferList || []);
      };

      for (const context of contexts) {
        this.relays[context] = func;
      }
    }
  }

  // @todo jobs don't currently ever reject
  public do<TJobArgs, TJobResult>(
    job: TJobConfig<TJobContextTypes, TJobArgs, TJobResult>,
    args: TJobArgs,
    transferList: Transferable[] = [],
  ): Promise<TJobResult> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      // Check if we can process this job
      const func = this.jobs[job.name];

      // First check if we can process the job.
      if (this.canProcess[job.requiredContext]) {
        // @todo can we make this more type safe?
        const result = await func.call(this, this.additionalContext, args);
        resolve(result as TJobResult);
        return;
      }

      // If we can't process it, then check if we have a registered relay for it
      if (this.relays[job.requiredContext]) {
        resolve(
          (await this.relays[job.requiredContext](
            job,
            args,
            transferList,
          )) as TJobResult,
        );

        return;
      }

      reject(new Error(`Job ${job.name} cannot be processed`));
    });
  }

  public async doRelayedJob(
    wrappedJob: TWrappedJob<unknown>,
    port: {
      postMessage: (result: TJobsMessageRelayResult) => void;
    },
  ) {
    const result = await this.do(
      wrappedJob.job,
      wrappedJob.args,
      wrappedJob.transferList,
    );

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
