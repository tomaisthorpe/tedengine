import { TCameraComponent, TActiveCameraComponent } from './camera-component';
import type { TPerspectiveCameraConfig } from './camera-component';
import { TProjectionType } from '../graphics';

describe('TCameraComponent', () => {
  describe('should create a component with the provided config', () => {
    const config: TPerspectiveCameraConfig = {
      type: TProjectionType.Perspective,
      fov: 60,
      zNear: 0.1,
      zFar: 1000,
    };
    const camera = new TCameraComponent(config);

    expect(camera.cameraConfig).toEqual({
      type: TProjectionType.Perspective,
      fov: 60,
      zNear: 0.1,
      zFar: 1000,
    });
  });
});

describe('TActiveCameraComponent', () => {
  it('should create an active camera component', () => {
    const activeCamera = new TActiveCameraComponent();
    expect(activeCamera).toBeInstanceOf(TActiveCameraComponent);
  });
});
