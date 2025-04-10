import { vec3 } from 'gl-matrix';
import {
  TGameState,
  TEngine,
  createBoxMesh,
  TMeshComponent,
  TTransform,
  TTransformComponent,
  TMaterialComponent,
  TShouldRenderComponent,
  TRigidBodyComponent,
  createBoxCollider,
  TCameraComponent,
  TActiveCameraComponent,
  TMouseInputComponent,
  TOrbitCameraComponent,
  TProjectionType,
  TOrbitCameraSystem,
  TMouseInputSystem,
  createSphereMesh,
  createSphereCollider,
  createPlaneMesh,
  createPlaneCollider,
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

    const boxMesh = createBoxMesh(1, 1, 1);

    const box = this.world.ecs.createEntity();
    this.world.ecs.addComponents(box, [
      new TTransformComponent(new TTransform(vec3.fromValues(0, 5, 0))),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TShouldRenderComponent(),
      new TRigidBodyComponent({ mass: 1 }, createBoxCollider(1, 1, 1)),
    ]);

    const box2 = this.world.ecs.createEntity();
    this.world.ecs.addComponents(box2, [
      new TTransformComponent(new TTransform(vec3.fromValues(-0.1, 10, 0.6))),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TShouldRenderComponent(),
      new TRigidBodyComponent({ mass: 1 }, createBoxCollider(1, 1, 1)),
    ]);

    const box3 = this.world.ecs.createEntity();
    this.world.ecs.addComponents(box3, [
      new TTransformComponent(new TTransform(vec3.fromValues(0.6, 3, 0.2))),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TShouldRenderComponent(),
      new TRigidBodyComponent({ mass: 1 }, createBoxCollider(1, 1, 1)),
    ]);

    const sphereMesh = createSphereMesh(0.5, 9, 12);

    const sphere = this.world.ecs.createEntity();
    this.world.ecs.addComponents(sphere, [
      new TTransformComponent(new TTransform(vec3.fromValues(-0.1, 8, 0.6))),
      new TMeshComponent({ source: 'inline', geometry: sphereMesh.geometry }),
      new TMaterialComponent(sphereMesh.material),
      new TShouldRenderComponent(),
      new TRigidBodyComponent({ mass: 1 }, createSphereCollider(0.5)),
    ]);

    const planeMesh = createPlaneMesh(10, 10);

    const plane = this.world.ecs.createEntity();
    this.world.ecs.addComponents(plane, [
      new TTransformComponent(new TTransform(vec3.fromValues(0, 0, 0))),
      new TMeshComponent({ source: 'inline', geometry: planeMesh.geometry }),
      new TMaterialComponent(planeMesh.material),
      new TShouldRenderComponent(),
      new TRigidBodyComponent({ mass: 0 }, createPlaneCollider(10, 10)),
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
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
