import { TJobManager } from './job-manager';
import { TJobContextTypes } from './context-types';
import { TMessageTypesJobs } from './messages';

describe('TJobManager.onRelayedResult', () => {
  test('ignores results for unknown UUIDs', () => {
    const manager = new TJobManager([]);

    expect(() =>
      manager.onRelayedResult({ uuid: 'missing', result: 'result' }),
    ).not.toThrow();
  });

  test('resolves and removes a known relayed job', () => {
    const manager = new TJobManager([]);
    const resolve = jest.fn();
    const reject = jest.fn();
    const relayedJobs = (
      manager as unknown as {
        relayedJobs: Record<
          string,
          | {
              resolve: (result: unknown) => void;
              reject: (error: unknown) => void;
            }
          | undefined
        >;
      }
    ).relayedJobs;
    relayedJobs.known = { resolve, reject };

    manager.onRelayedResult({ uuid: 'known', result: 'result' });

    expect(resolve).toHaveBeenCalledWith('result');
    expect(reject).not.toHaveBeenCalled();
    expect(relayedJobs.known).toBeUndefined();
  });

  test('rejects and removes a failed relayed job', () => {
    const manager = new TJobManager([]);
    const resolve = jest.fn();
    const reject = jest.fn();
    const relayedJobs = (
      manager as unknown as {
        relayedJobs: Record<
          string,
          { resolve: typeof resolve; reject: typeof reject } | undefined
        >;
      }
    ).relayedJobs;
    relayedJobs.known = { resolve, reject };
    const error = new Error('job failed');

    manager.onRelayedResult({ uuid: 'known', error });

    expect(reject).toHaveBeenCalledWith(error);
    expect(resolve).not.toHaveBeenCalled();
    expect(relayedJobs.known).toBeUndefined();
  });
});

describe('TJobManager.doRelayedJob', () => {
  test('posts a failed result when a job rejects', async () => {
    const manager = new TJobManager([TJobContextTypes.Engine]);
    const job = {
      name: 'failing-job',
      requiredContext: TJobContextTypes.Engine,
    };
    const error = new Error('job failed');
    manager.registerJob(job, async () => {
      throw error;
    });
    const port = { postMessage: jest.fn() };

    await manager.doRelayedJob(
      { uuid: 'job-uuid', job, args: undefined, transferList: [] },
      port,
    );

    expect(port.postMessage).toHaveBeenCalledWith({
      type: TMessageTypesJobs.RELAY_RESULT,
      wrappedResult: { uuid: 'job-uuid', error },
    });
  });
});
