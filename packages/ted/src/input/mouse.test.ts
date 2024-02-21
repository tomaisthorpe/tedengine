import type { IProjectionContext } from './mouse';
import TMouse from './mouse';
import { TEventQueue } from '../index';
import { mat4 } from 'gl-matrix';
describe('TMouse', () => {
  const eventQueue = new TEventQueue();
  const canvas = document.createElement('canvas');

  jest.spyOn(canvas, 'width', 'get').mockReturnValue(500);
  jest.spyOn(canvas, 'height', 'get').mockReturnValue(500);

  jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
    left: 100,
    top: 250,
    width: 500,
    height: 500,
    x: 100,
    y: 250,
    bottom: 600,
    right: 800,
    toJSON: function () {
      throw new Error('Function not implemented.');
    },
  });

  // Undefined projection matrix, so no world space coordinates are calculated
  const projectionContext: IProjectionContext = {};

  // @todo add remove event listeners
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  new TMouse(eventQueue, canvas, projectionContext);

  test('mousemove event should be broadcasted', () => {
    const event = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 500,
    });

    const broadcastSpy = jest.spyOn(eventQueue, 'broadcast');

    window.dispatchEvent(event);

    expect(broadcastSpy).toHaveBeenCalledWith({
      type: 'mousemove',
      clientX: 100,
      clientY: 500,
      x: 0,
      y: 250,
      px: -1,
      py: 0,
    });
  });

  test('mouseup event should be broadcasted', () => {
    const event = new MouseEvent('mouseup', {
      clientX: 150,
      clientY: 250,
      button: 0,
    });

    const broadcastSpy = jest.spyOn(eventQueue, 'broadcast');

    canvas.dispatchEvent(event);

    expect(broadcastSpy).toHaveBeenCalledWith({
      type: 'mouseup',
      subType: '0',
      clientX: 150,
      clientY: 250,
      x: 50,
      y: 0,
      px: -0.8,
      py: 1,
    });
  });

  test('mousedown event should be broadcasted', () => {
    const event = new MouseEvent('mousedown', {
      clientX: 200,
      clientY: 300,
      button: 2,
    });

    const broadcastSpy = jest.spyOn(eventQueue, 'broadcast');

    canvas.dispatchEvent(event);

    expect(broadcastSpy).toHaveBeenCalledWith({
      type: 'mousedown',
      subType: '2',
      clientX: 200,
      clientY: 300,
      x: 100,
      y: 50,
      px: -0.6,
      py: 0.8,
    });
  });
});

describe('TMouse with projection matrix', () => {
  const eventQueue = new TEventQueue();
  const canvas = document.createElement('canvas');

  jest.spyOn(canvas, 'width', 'get').mockReturnValue(500);
  jest.spyOn(canvas, 'height', 'get').mockReturnValue(500);

  jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
    left: 100,
    top: 250,
    width: 500,
    height: 500,
    x: 100,
    y: 250,
    bottom: 600,
    right: 800,
    toJSON: function () {
      throw new Error('Function not implemented.');
    },
  });

  // Undefined projection matrix, so no world space coordinates are calculated
  const projectionContext: IProjectionContext = {
    projectionMatrix: mat4.ortho(mat4.create(), -250, 250, -250, 250, 0.1, 100),
  };

  // @todo add remove event listeners
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  new TMouse(eventQueue, canvas, projectionContext);

  test('mousemove event should contain world X/Y', () => {
    const event = new MouseEvent('mousemove', {
      clientX: 225,
      clientY: 500,
    });

    const broadcastSpy = jest.spyOn(eventQueue, 'broadcast');

    window.dispatchEvent(event);

    expect(broadcastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'mousemove',
        worldX: expect.closeTo(-125),
        worldY: 0,
      }),
    );
  });

  test('mouseup event should contain world X/Y', () => {
    const event = new MouseEvent('mouseup', {
      clientX: 150,
      clientY: 250,
      button: 0,
    });

    const broadcastSpy = jest.spyOn(eventQueue, 'broadcast');

    canvas.dispatchEvent(event);

    expect(broadcastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'mouseup',
        worldX: expect.closeTo(-200),
        worldY: expect.closeTo(250),
      }),
    );
  });

  test('mousedown event should contain world X/Y', () => {
    const event = new MouseEvent('mousedown', {
      clientX: 200,
      clientY: 300,
      button: 2,
    });

    const broadcastSpy = jest.spyOn(eventQueue, 'broadcast');

    canvas.dispatchEvent(event);

    expect(broadcastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'mousedown',
        worldX: expect.closeTo(-150),
        worldY: expect.closeTo(200),
      }),
    );
  });
});
