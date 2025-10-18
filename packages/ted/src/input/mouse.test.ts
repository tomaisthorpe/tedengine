import { TMouse } from './mouse';
import { TEventQueue } from '../index';
describe('TMouse', () => {
  const eventQueue = new TEventQueue();
  const canvas = document.createElement('canvas');

  jest.spyOn(canvas, 'clientWidth', 'get').mockReturnValue(500);
  jest.spyOn(canvas, 'clientHeight', 'get').mockReturnValue(500);

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

  // @todo add remove event listeners
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  new TMouse(eventQueue, canvas);

  test('mousemove event should be broadcasted', () => {
    const event = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 500,
    });

    // Assign these here as the above does not properly set them
    // @ts-expect-error - above doesn't work
    event.movementX = 50;
    // @ts-expect-error - above doesn't work
    event.movementY = 50;

    const broadcastSpy = jest.spyOn(eventQueue, 'broadcast');

    window.dispatchEvent(event);

    expect(broadcastSpy).toHaveBeenCalledWith({
      type: 'mousemove',
      client: new Float32Array([100, 500]),
      screen: new Float32Array([0, 250]),
      clip: new Float32Array([-1, 0]),
      movement: {
        client: new Float32Array([50, 50]),
        clip: new Float32Array([0.1, -0.1]),
      },
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
      client: new Float32Array([150, 250]),
      screen: new Float32Array([50, 0]),
      clip: new Float32Array([-0.8, 1]),
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
      client: new Float32Array([200, 300]),
      screen: new Float32Array([100, 50]),
      clip: new Float32Array([-0.6, 0.8]),
    });
  });
});
