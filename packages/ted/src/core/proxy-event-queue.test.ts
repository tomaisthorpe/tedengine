import type { IChildEventQueue, TEvent } from './event-queue';
import TProxyEventQueue from './proxy-event-queue';

describe('TProxyEventQueue', () => {
  let broadcast: jest.Mock<IChildEventQueue['broadcast']>;
  let eventQueueFunc: jest.Mock<() => IChildEventQueue>;
  let proxyEventQueue: TProxyEventQueue;

  beforeEach(() => {
    broadcast = jest.fn();
    eventQueueFunc = jest.fn(() => ({ broadcast })) as any;
    proxyEventQueue = new TProxyEventQueue(eventQueueFunc as any);
  });

  test('should call the broadcast method of the child event queue', () => {
    const event: TEvent = { type: 'test', payload: {} };
    const dontRelay = true;

    proxyEventQueue.broadcast(event, dontRelay);

    expect(eventQueueFunc).toHaveBeenCalledTimes(1);
    expect(broadcast).toHaveBeenCalledTimes(1);
    expect(broadcast).toHaveBeenCalledWith(event, dontRelay);
  });
});
