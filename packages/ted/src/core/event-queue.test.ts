import type { TEvent } from '../index';
import { TEventQueue, TMessageTypesCore } from '../index';

describe('TEventQueue', () => {
  let eventQueue: TEventQueue;
  let mockPort: MessagePort;

  beforeEach(() => {
    eventQueue = new TEventQueue();
    mockPort = {
      postMessage: jest.fn(),
    } as unknown as MessagePort;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should add event to the queue', () => {
    const event: TEvent = {
      type: 'test',
    };

    eventQueue.broadcast(event);

    expect(eventQueue['queue']).toContain(event);
  });

  test('should relay event to message ports', () => {
    const event: TEvent = {
      type: 'test',
    };

    eventQueue = new TEventQueue([mockPort]);

    eventQueue.broadcast(event);

    expect(mockPort.postMessage).toHaveBeenCalledWith({
      type: TMessageTypesCore.EVENT_RELAY,
      event,
    });
  });

  test('should not relay event if dontRelay flag is true', () => {
    const event: TEvent = {
      type: 'test',
    };

    eventQueue = new TEventQueue([mockPort]);

    eventQueue.broadcast(event, true);

    expect(mockPort.postMessage).not.toHaveBeenCalled();
  });

  test('should add event listener', () => {
    const event: TEvent = {
      type: 'test',
    };
    const listener = jest.fn();

    eventQueue.addListener('test', listener);
    eventQueue.broadcast(event);
    eventQueue.update();

    expect(listener).toHaveBeenCalledWith(event);
  });

  test('should add event listener with sub type', () => {
    const event: TEvent = {
      type: 'test',
      subType: 'sub',
    };
    const listener = jest.fn();

    eventQueue.addListener('test', 'sub', listener);
    eventQueue.broadcast(event);
    eventQueue.update();

    expect(listener).toHaveBeenCalledWith(event);
  });

  test('should remove event listener', () => {
    const event: TEvent = {
      type: 'test',
    };
    const listener = jest.fn();

    eventQueue.addListener('test', listener);
    eventQueue.removeListener('test', listener);
    eventQueue.broadcast(event);

    expect(listener).not.toHaveBeenCalled();
  });

  test('should remove event listener with sub type', () => {
    const event: TEvent = {
      type: 'test',
      subType: 'sub',
    };
    const listener = jest.fn();

    eventQueue.addListener('test', 'sub', listener);
    eventQueue.removeListener('test', 'sub', listener);
    eventQueue.broadcast(event);

    expect(listener).not.toHaveBeenCalled();
  });

  test('should update event queue', () => {
    const event1: TEvent = {
      type: 'test1',
    };
    const event2: TEvent = {
      type: 'test2',
    };
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    eventQueue.addListener('test1', listener1);
    eventQueue.addListener('test2', listener2);
    eventQueue.broadcast(event1);
    eventQueue.broadcast(event2);
    eventQueue.update();

    expect(listener1).toHaveBeenCalledWith(event1);
    expect(listener2).toHaveBeenCalledWith(event2);
    expect(eventQueue['queue']).toHaveLength(0);
  });
});
