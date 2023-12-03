import { TBaseCamera } from '../index';

test('moveBy should move by given amount', () => {
  const camera = new TBaseCamera();

  camera.moveBy(1, 2, 3);
  expect([...camera.cameraComponent.transform.translation]).toEqual([1, 2, 3]);

  // Run again to ensure isn't setting the values
  camera.moveBy(2, 4, 6);
  expect([...camera.cameraComponent.transform.translation]).toEqual([3, 6, 9]);
});

test('moveTo should set to the given position', () => {
  const camera = new TBaseCamera();

  camera.moveTo(1, 2, 3);
  expect([...camera.cameraComponent.transform.translation]).toEqual([1, 2, 3]);

  // Run again to ensure isn't adding values
  camera.moveTo(2, 4, 6);
  expect([...camera.cameraComponent.transform.translation]).toEqual([2, 4, 6]);
});

test('onUpdate should call update on controller', async () => {
  const camera = new TBaseCamera();
  const controller = { onUpdate: jest.fn() };

  camera.controller = controller;

  await camera.onUpdate({} as any, 0);

  expect(controller.onUpdate).toHaveBeenCalledTimes(1);
});
