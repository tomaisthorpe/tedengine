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

  test('lerp = 1 should result in instant transition', async () => {
    camera.lerp = 1;
    camera.moveTo(vec3.fromValues(10, 10, 10));

    await camera.onUpdate({} as any, 1);

    expect(camera.cameraComponent.transform.translation).toEqual(
      vec3.fromValues(10, 10, 10),
    );
  });

  test('lerp = 0 should result in no movement', async () => {
    camera.lerp = 0;
    camera.moveTo(vec3.fromValues(10, 10, 10));

    await camera.onUpdate({} as any, 1);

    expect(camera.cameraComponent.transform.translation).toEqual(
      vec3.fromValues(0, 0, 0),
    );
  });

  test('lerp = 0.5 should result in partial movement', async () => {
    camera.lerp = 0.5;
    camera.moveTo(vec3.fromValues(10, 10, 10));

    await camera.onUpdate({} as any, 1);

    expect(camera.cameraComponent.transform.translation).toEqual(
      vec3.fromValues(5, 5, 5),
    );
  });
});
