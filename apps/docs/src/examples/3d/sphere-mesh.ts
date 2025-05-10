import { vec3 } from 'gl-matrix';
import {
  TGameState,
  TEngine,
  TVisibilityComponent,
  TMeshComponent,
  TTransform,
  TTransformComponent,
  createSphereMesh,
  TMaterialComponent,
  TOrbitCameraComponent,
  TActiveCameraComponent,
  TCameraComponent,
  TMouseInputComponent,
  TProjectionType,
  TOrbitCameraSystem,
  TMouseInputSystem,
  TTransformBundle,
} from '@tedengine/ted';

class SphereState extends TGameState {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    this.world.addSystem(
      new TOrbitCameraSystem(this.world, engine.inputManager),
    );

    this.world.addSystem(
      new TMouseInputSystem(this.world, engine.inputManager),
    );
    const sphere = createSphereMesh(0.5, 12, 12);
    this.world.createEntity([
      TTransformBundle.with(
        new TTransformComponent(new TTransform(vec3.fromValues(0, 0, 0))),
      ),
      new TMeshComponent({ source: 'inline', geometry: sphere.geometry }),
      new TMaterialComponent(sphere.material),
      new TVisibilityComponent(),
    ]);

    const camera = this.world.createEntity();
    this.world.addComponents(camera, [
      TTransformBundle.with(
        new TTransformComponent(new TTransform(vec3.fromValues(0, 0, 0))),
      ),
      new TCameraComponent({ type: TProjectionType.Perspective, fov: 45 }),
      new TActiveCameraComponent(),
      new TMouseInputComponent(),
      new TOrbitCameraComponent({
        distance: 5,
        speed: 0.5,
        enableDrag: true,
      }),
    ]);

    this.world.config.lighting = {
      ambientLight: {
        intensity: 0.1,
      },
      directionalLight: {
        direction: vec3.fromValues(-0.5, 0.7, 0.2),
        intensity: 1,
      },
    };
  }
}

const config = {
  states: {
    game: SphereState,
  },
  defaultState: 'game',
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
