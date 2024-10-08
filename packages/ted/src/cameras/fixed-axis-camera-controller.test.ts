import { vec3 } from 'gl-matrix';
import {
  TSceneComponent,
  TPerspectiveCamera,
  TActor,
  TFixedAxisCameraController,
} from '../index';

describe.each([
  ['x', vec3.fromValues(5, 0, 0)],
  ['y', vec3.fromValues(0, 5, 0)],
  ['z', vec3.fromValues(0, 0, 5)],
])('fixed %s axis', (axis, offset) => {
  test('should follow given scene component', () => {
    const actor = new TActor();
    const comp = new TSceneComponent(actor);

    const controller = new TFixedAxisCameraController({ axis, distance: 5 });
    controller.attachTo(comp);

    const camera = new TPerspectiveCamera({} as any);
    controller.onUpdate(camera, {} as any, 0);

    const expected = vec3.add(
      vec3.create(),
      comp.transform.translation,
      offset,
    );

    expect([...camera.cameraComponent.transform.translation]).toEqual([
      ...expected,
    ]);

    comp.transform.translation = vec3.fromValues(1, 2, 5);
    controller.onUpdate(camera, {} as any, 0);

    const expectedAfterMove = vec3.add(
      vec3.create(),
      comp.transform.translation,
      offset,
    );

    expect([...camera.cameraComponent.transform.translation]).toEqual([
      ...expectedAfterMove,
    ]);
  });

  test('should correctly follow a nested scene component', () => {
    const actor = new TActor();
    const root = new TSceneComponent(actor);
    root.transform.translation = vec3.fromValues(1, 2, 3);
    const comp = new TSceneComponent(actor);
    comp.transform.translation = vec3.fromValues(-1, -1, -1);
    comp.attachTo(root);

    const controller = new TFixedAxisCameraController({ axis, distance: 5 });
    controller.attachTo(comp);

    const camera = new TPerspectiveCamera({} as any);
    controller.onUpdate(camera, {} as any, 0);

    const expected = vec3.add(
      vec3.create(),
      comp.getWorldTransform().translation,
      offset,
    );
    expect([...camera.cameraComponent.transform.translation]).toEqual([
      ...expected,
    ]);
  });
});

describe('onUpdate with deadzone', () => {
  test('should move camera to target position and rotate camera if linear distance is greater than deadzone', () => {
    const actor = new TActor();
    const comp = new TSceneComponent(actor);
    comp.transform.translation = vec3.fromValues(1, 2, 3);

    const camera = new TPerspectiveCamera({} as any);
    const controller = new TFixedAxisCameraController({
      axis: 'x',
      distance: 5,
      deadzone: 6,
    });
    controller.attachTo(comp);

    const translation = vec3.fromValues(6, 2, 3);

    jest.spyOn(controller, 'moveTo');

    controller.onUpdate(camera, {} as any, 0);

    expect(controller.moveTo).toHaveBeenCalledWith(translation, false);
  });

  test('should not move camera if linear distance is less than or equal to deadzone', () => {
    const actor = new TActor();
    const comp = new TSceneComponent(actor);
    comp.transform.translation = vec3.fromValues(1, 2, 3);

    const camera = new TPerspectiveCamera({} as any);
    const controller = new TFixedAxisCameraController({
      axis: 'x',
      distance: 5,
      deadzone: 8,
    });
    controller.attachTo(comp);

    jest.spyOn(controller, 'moveTo');

    controller.onUpdate(camera, {} as any, 0);

    expect(controller.moveTo).not.toHaveBeenCalled();
  });
});
