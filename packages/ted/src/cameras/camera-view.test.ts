import { getDefaultCameraView } from './camera-view';
import type { TCameraView } from '../index';
import { TProjectionType, TTransform } from '../index';

describe('getDefaultCameraView', () => {
  test('should return the default camera view', () => {
    const expected: TCameraView = {
      projectionType: TProjectionType.Perspective,
      fov: 45,
      transform: new TTransform().getMatrix(),
    };

    const result = getDefaultCameraView();

    expect(result).toEqual(expected);
  });
});
