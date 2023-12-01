import { vec3 } from 'gl-matrix';
import {
  TSceneComponent,
  TPerspectiveCamera,
  TActor,
  TTopDownCameraController,
} from '../index';

test('should follow given scene component', () => {
  const actor = new TActor();
  const comp = new TSceneComponent(actor);

  const controller = new TTopDownCameraController({ distance: 5 });
  controller.attachTo(comp);

  const camera = new TPerspectiveCamera();
  controller.onUpdate(camera, {} as any, 0);

  expect([...camera.cameraComponent.transform.translation]).toEqual([0, 0, -5]);

  comp.transform.translation = vec3.fromValues(1, 2, 5);
  controller.onUpdate(camera, {} as any, 0);

  expect([...camera.cameraComponent.transform.translation]).toEqual([1, 2, 0]);
});

test('should correctly follow a nested scene component', () => {
  const actor = new TActor();
  const root = new TSceneComponent(actor);
  root.transform.translation = vec3.fromValues(1, 2, 3);
  const comp = new TSceneComponent(actor);
  comp.transform.translation = vec3.fromValues(-1, -1, -1);
  comp.attachTo(root);

  const controller = new TTopDownCameraController({ distance: 5 });
  controller.attachTo(comp);

  const camera = new TPerspectiveCamera();
  controller.onUpdate(camera, {} as any, 0);

  expect([...camera.cameraComponent.transform.translation]).toEqual([0, 1, -3]);
});
