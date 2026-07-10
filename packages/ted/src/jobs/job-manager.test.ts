import { TJobManager } from './job-manager';

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
    const relayedJobs = (
      manager as unknown as {
        relayedJobs: Record<string, ((result: unknown) => void) | undefined>;
      }
    ).relayedJobs;
    relayedJobs.known = resolve;

    manager.onRelayedResult({ uuid: 'known', result: 'result' });

    expect(resolve).toHaveBeenCalledWith('result');
    expect(relayedJobs.known).toBeUndefined();
  });
});
