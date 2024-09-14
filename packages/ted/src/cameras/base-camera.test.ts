import { vec3 } from 'gl-matrix';
import { TBaseCamera } from '../index';

describe('TBaseCamera', () => {
  let camera: TBaseCamera;

  beforeEach(() => {
    camera = new TBaseCamera({} as any);
  });

  test('moveBy should move by given amount', () => {
    camera.moveBy(vec3.fromValues(1, 2, 3));
    expect([...camera.cameraComponent.transform.translation]).toEqual([
      1, 2, 3,
    ]);

    // Run again to ensure isn't setting the values
    camera.moveBy(vec3.fromValues(2, 4, 6));
    expect([...camera.cameraComponent.transform.translation]).toEqual([
      3, 6, 9,
    ]);
  });

  test('moveTo should set to the given position', () => {
    camera.moveTo(vec3.fromValues(1, 2, 3));
    expect([...camera.cameraComponent.transform.translation]).toEqual([
      1, 2, 3,
    ]);

    // Run again to ensure isn't adding values
    camera.moveTo(vec3.fromValues(2, 4, 6));
    expect([...camera.cameraComponent.transform.translation]).toEqual([
      2, 4, 6,
    ]);
  });

  test('onUpdate should call update on controller', async () => {
    const controller = { onUpdate: jest.fn() };

    camera.controller = controller;

    await camera.onUpdate({} as any, 0);

    expect(controller.onUpdate).toHaveBeenCalledTimes(1);
  });

  test('lookAt should set the rotation correctly', () => {
    camera.lookAt(vec3.fromValues(1, 2, 3));
    expect([...camera.cameraComponent.transform.rotation]).toMatchSnapshot();

    // Run again with different values
    camera.lookAt(vec3.fromValues(-1, -2, -3));
    expect([...camera.cameraComponent.transform.rotation]).toMatchSnapshot();
  });
});
