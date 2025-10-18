import { vec3, quat } from 'gl-matrix';
import type { TEngine } from '../engine/engine';
import { TCameraComponent, TActiveCameraComponent } from './camera-component';
import { TComponent } from '../core/component';
import type { TEntityQuery } from '../core/entity-query';
import { TSystem, TSystemPriority } from '../core/system';
import { TMouseInputComponent } from '../input/mouse-input';
import type { TInputManager } from '../input/input-manager';
import { TInputDevice } from '../input/input-manager';
import type { TWorld } from '../core/world';
import { TTransform } from '../math/transform';
import { TTransformComponent } from '../components';

export interface TOrbitCameraConfig {
  distance: number;
  speed?: number;
  enableDrag?: boolean;
  paused?: boolean;
}

export class TOrbitCameraComponent extends TComponent {
  public distance: number;
  public speed: number;
  public enableDrag: boolean;
  public paused: boolean;

  public quat: quat;
  public initialTilt: quat; // Store the initial tilt separately

  public lastMouseX = 0;
  public lastMouseY = 0;

  constructor(config: TOrbitCameraConfig, q?: quat) {
    super();

    this.distance = config.distance;
    this.speed = config.speed ?? 1;
    this.enableDrag = config.enableDrag ?? true;
    this.paused = config.paused ?? false;

    // Store the initial tilt separately
    this.initialTilt = quat.rotateX(quat.create(), quat.create(), -0.4);

    // Initialize the rotation quaternion
    this.quat = q ?? quat.create();
  }
}

export class TOrbitCameraSystem extends TSystem {
  public readonly priority: number = TSystemPriority.Update;

  private query: TEntityQuery;
  constructor(
    private world: TWorld,
    private inputManager: TInputManager,
  ) {
    super();

    this.query = world.createQuery([
      TCameraComponent,
      TTransformComponent,
      TOrbitCameraComponent,
      TMouseInputComponent,
      TActiveCameraComponent,
    ]);

    inputManager.mapInput('ToggleDrag', {
      device: TInputDevice.Mouse,
      key: '0',
    });
  }

  public async update(
    engine: TEngine,
    world: TWorld,
    delta: number,
  ): Promise<void> {
    const entities = this.query.execute();
    for (const entity of entities) {
      const camera = world.getComponents(entity)?.get(TCameraComponent);
      const transform = world.getComponents(entity)?.get(TTransformComponent);
      const mouseInputComponent = world
        .getComponents(entity)
        ?.get(TMouseInputComponent);
      const orbitCamera = world
        .getComponents(entity)
        ?.get(TOrbitCameraComponent);

      if (!camera || !mouseInputComponent || !orbitCamera || !transform) {
        continue;
      }

      // Update the orbit camera's quaternion if not paused
      if (!orbitCamera.paused) {
        // Only rotate around Y-axis for automatic rotation
        quat.rotateY(
          orbitCamera.quat,
          orbitCamera.quat,
          orbitCamera.speed * delta,
        );
      } else if (mouseInputComponent.mouseLocation) {
        const diffX =
          orbitCamera.lastMouseX - mouseInputComponent.mouseLocation.client[0];
        const diffY =
          orbitCamera.lastMouseY - mouseInputComponent.mouseLocation.client[1];

        // Rotate around Y-axis for horizontal movement
        orbitCamera.initialTilt = quat.rotateY(
          orbitCamera.initialTilt,
          orbitCamera.initialTilt,
          diffX * 0.01,
        );

        // Rotate around X-axis for vertical movement
        orbitCamera.initialTilt = quat.rotateX(
          orbitCamera.initialTilt,
          orbitCamera.initialTilt,
          diffY * 0.01,
        );

        orbitCamera.lastMouseX = mouseInputComponent.mouseLocation.client[0];
        orbitCamera.lastMouseY = mouseInputComponent.mouseLocation.client[1];
      }

      if (
        this.inputManager.wasActionJustPressed('ToggleDrag') &&
        orbitCamera.enableDrag
      ) {
        orbitCamera.paused = true;
        orbitCamera.lastMouseX =
          mouseInputComponent.mouseLocation?.client[0] ?? 0;
        orbitCamera.lastMouseY =
          mouseInputComponent.mouseLocation?.client[1] ?? 0;
      } else if (this.inputManager.wasActionJustReleased('ToggleDrag')) {
        orbitCamera.paused = false;
      }

      // Create a base vector representing distance along z-axis
      const baseVector = vec3.fromValues(0, 0, orbitCamera.distance);

      // Combine the rotation quaternion with the initial tilt
      const combinedQuat = quat.multiply(
        quat.create(),
        orbitCamera.quat,
        orbitCamera.initialTilt,
      );

      // Rotate the baseVector by the combined quaternion to get the actual position
      const rotatedVector = vec3.transformQuat(
        vec3.create(),
        baseVector,
        combinedQuat,
      );

      // Create a new transform with the calculated position and face the origin
      const newTransform = new TTransform(rotatedVector);
      newTransform.lookAt(vec3.fromValues(0, 0, 0));

      transform.transform = newTransform;
    }
  }
}
