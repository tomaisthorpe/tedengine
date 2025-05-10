import { vec3 } from 'gl-matrix';
import {
  TGameState,
  TEngine,
  createBoxMesh,
  TMeshComponent,
  TTransform,
  TTransformComponent,
  TMaterialComponent,
  TVisibilityComponent,
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
  TTransformBundle,
} from '@tedengine/ted';

class ColliderState extends TGameState {
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

    const boxMesh = createBoxMesh(1, 1, 1);
    const box = this.world.createEntity();
    this.world.addComponents(box, [
      TTransformBundle,
      new TTransformComponent(new TTransform(vec3.fromValues(0, 5, 0))),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TVisibilityComponent(),
      new TRigidBodyComponent({ mass: 1 }, createBoxCollider(1, 1, 1)),
    ]);

    const box2 = this.world.createEntity();
    this.world.addComponents(box2, [
      TTransformBundle,
      new TTransformComponent(new TTransform(vec3.fromValues(-0.1, 10, 0.6))),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TVisibilityComponent(),
      new TRigidBodyComponent({ mass: 1 }, createBoxCollider(1, 1, 1)),
    ]);

    const box3 = this.world.createEntity();
    this.world.addComponents(box3, [
      TTransformBundle,
      new TTransformComponent(new TTransform(vec3.fromValues(0.6, 3, 0.2))),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TVisibilityComponent(),
      new TRigidBodyComponent({ mass: 1 }, createBoxCollider(1, 1, 1)),
    ]);

    const sphereMesh = createSphereMesh(0.5, 9, 12);

    const sphere = this.world.createEntity();
    this.world.addComponents(sphere, [
      TTransformBundle,
      new TTransformComponent(new TTransform(vec3.fromValues(-0.1, 8, 0.6))),
      new TMeshComponent({ source: 'inline', geometry: sphereMesh.geometry }),
      new TMaterialComponent(sphereMesh.material),
      new TVisibilityComponent(),
      new TRigidBodyComponent({ mass: 1 }, createSphereCollider(0.5)),
    ]);

    const planeMesh = createPlaneMesh(10, 10);

    const plane = this.world.createEntity();
    this.world.addComponents(plane, [
      TTransformBundle,
      new TTransformComponent(new TTransform(vec3.fromValues(0, 0, 0))),
      new TMeshComponent({ source: 'inline', geometry: planeMesh.geometry }),
      new TMaterialComponent(planeMesh.material),
      new TVisibilityComponent(),
      new TRigidBodyComponent({ mass: 0 }, createPlaneCollider(10, 10)),
    ]);

    const perspective = this.world.createEntity();
    const perspectiveComponent = new TCameraComponent({
      type: TProjectionType.Perspective,
      fov: 45,
    });
    this.world.addComponents(perspective, [
      perspectiveComponent,
      TTransformBundle,
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
