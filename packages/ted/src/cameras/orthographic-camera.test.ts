import { TOrthographicCamera, TProjectionType } from '../index';

describe('TOrthographicCamera', () => {
  test('should return the correct camera view', () => {
    const camera = new TOrthographicCamera();
    const expected = {
      projectionType: TProjectionType.Orthographic,
      transform: camera.cameraComponent.getWorldTransform().getMatrix(),
    };

    const result = camera.getView();

    expect(result).toEqual(expected);
  });
});
