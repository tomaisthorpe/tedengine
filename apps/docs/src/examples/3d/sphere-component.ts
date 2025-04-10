import { vec3 } from 'gl-matrix';
import {
  TGameState,
  TEngine,
  TShouldRenderComponent,
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
} from '@tedengine/ted';

class SphereState extends TGameState {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    this.world.ecs.addSystem(
      new TOrbitCameraSystem(this.world.ecs, engine.inputManager),
    );

    this.world.ecs.addSystem(
      new TMouseInputSystem(this.world.ecs, engine.inputManager),
    );
    const sphere = this.world.ecs.createEntity();

    const mesh = createSphereMesh(0.5, 12, 12);
    this.world.ecs.addComponents(sphere, [
      new TTransformComponent(new TTransform(vec3.fromValues(0, 0, 0))),
      new TMeshComponent({ source: 'inline', geometry: mesh.geometry }),
      new TMaterialComponent(mesh.material),
      new TShouldRenderComponent(),
    ]);

    const camera = this.world.ecs.createEntity();
    this.world.ecs.addComponents(camera, [
      new TTransformComponent(new TTransform(vec3.fromValues(0, 0, 0))),
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
