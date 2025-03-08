import { vec3 } from 'gl-matrix';
import {
  TGameState,
  TEngine,
  TTransformComponent,
  createBoxCollider,
  TMaterialComponent,
  TMeshComponent,
  TRigidBodyComponent,
  TShouldRenderComponent,
  TTransform,
  createBoxMesh,
  TActiveCameraComponent,
  TCameraComponent,
  TMouseInputComponent,
  TOrbitCameraComponent,
  TProjectionType,
  createPlaneCollider,
  createPlaneMesh,
  TOrbitCameraSystem,
  TMouseInputSystem,
} from '@tedengine/ted';

class ColliderState extends TGameState {
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
    const rows = 10;
    const cols = 10;
    const levels = 6;

    const spaceX = 18 / rows;
    const spaceZ = 18 / cols;
    const spaceY = 3;

    const maxJitter = 0.4;
    const boxMesh = createBoxMesh(1, 1, 1);

    for (let l = 0; l < levels; l++) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const jitter = (Math.random() * 2 - 1) * maxJitter;
          const x = -9 + spaceX * c + jitter;
          const z = -9 + spaceZ * r + jitter;
          const y = 0.5 + spaceY * l + jitter;

          const box = this.world.ecs.createEntity();
          this.world.ecs.addComponents(box, [
            new TTransformComponent(new TTransform(vec3.fromValues(x, y, z))),
            new TMeshComponent({
              source: 'inline',
              geometry: boxMesh.geometry,
            }),
            new TMaterialComponent(boxMesh.material),
            new TShouldRenderComponent(),
            new TRigidBodyComponent({ mass: 1 }, createBoxCollider(1, 1, 1)),
          ]);
        }
      }
    }

    const planeMesh = createPlaneMesh(40, 40);
    const plane = this.world.ecs.createEntity();
    this.world.ecs.addComponents(plane, [
      new TTransformComponent(new TTransform(vec3.fromValues(0, 0, 0))),
      new TMeshComponent({ source: 'inline', geometry: planeMesh.geometry }),
      new TMaterialComponent(planeMesh.material),
      new TShouldRenderComponent(),
      new TRigidBodyComponent({ mass: 0 }, createPlaneCollider(40, 40)),
    ]);

    const perspective = this.world.ecs.createEntity();
    const perspectiveComponent = new TCameraComponent({
      type: TProjectionType.Perspective,
      fov: 45,
    });
    this.world.ecs.addComponents(perspective, [
      perspectiveComponent,
      new TTransformComponent(new TTransform(vec3.fromValues(0, 0, 0))),
      new TActiveCameraComponent(),
      new TOrbitCameraComponent({
        distance: 20,
        speed: 0.5,
        enableDrag: true,
        paused: false,
      }),
      new TMouseInputComponent(),
    ]);
  }
}

const config = {
  states: {
    game: ColliderState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
