import TMouse from './mouse';
import { TEventQueue } from '../index';
describe('TMouse', () => {
  const eventQueue = new TEventQueue();
  const canvas = document.createElement('canvas');

  jest.spyOn(canvas, 'offsetLeft', 'get').mockReturnValue(100);
  jest.spyOn(canvas, 'offsetTop', 'get').mockReturnValue(100);

  jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
    left: 100,
    top: 250,
    width: 500,
    height: 500,
    x: 100,
    y: 200,
    bottom: 600,
    right: 800,
    toJSON: function () {
      throw new Error('Function not implemented.');
    },
  });

  // @todo add remove event listeners
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mouse: TMouse = new TMouse(eventQueue, canvas);

  test('mousemove event should be broadcasted', () => {
    const event = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 200,
    });

    const broadcastSpy = jest.spyOn(eventQueue, 'broadcast');

    window.dispatchEvent(event);
    eventQueue.update();

    expect(broadcastSpy).toHaveBeenCalledWith({
      type: 'mousemove',
      clientX: 100,
      clientY: 200,
      x: 0,
      y: -50,
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
    });
  });
});
