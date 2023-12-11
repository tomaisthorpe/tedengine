import { TPerspectiveCamera, TProjectionType } from '../index';

describe('TPerspectiveCamera', () => {
  test('should return the correct camera view', () => {
    const camera = new TPerspectiveCamera();
    const expected = {
      projectionType: TProjectionType.Perspective,
      transform: camera.cameraComponent.getWorldTransform().getMatrix(),
      fov: camera.fov,
    };

    const result = camera.getView();

    expect(result).toEqual(expected);
  });
});
