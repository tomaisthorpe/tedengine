import { vec3 } from 'gl-matrix';
import {
  TGameState,
  TEngine,
  TMouseInputSystem,
  createBoxCollider,
  createBoxMesh,
  createPlaneCollider,
  createPlaneMesh,
  createSphereCollider,
  createSphereMesh,
  TActiveCameraComponent,
  TCameraComponent,
  TMaterialComponent,
  TMeshComponent,
  TMouseInputComponent,
  TOrbitCameraComponent,
  TOrbitCameraSystem,
  TProjectionType,
  TRigidBodyComponent,
  TVisibilityComponent,
  TTransform,
  TTransformComponent,
} from '@tedengine/ted';
import type { TCollisionStartEvent } from '@tedengine/ted';
import { TEventTypesPhysics } from '../../../../../packages/ted/src/physics/events';

class ColliderState extends TGameState {
  public async beforeWorldCreate(engine: TEngine) {
    // Hook into before world create so that world config can be modified before it is created
    this.world?.config.collisionClasses.push({
      name: 'CustomClass',
    });
  }

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
      new TTransformComponent(new TTransform(vec3.fromValues(0, 5, 0))),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TVisibilityComponent(),
      new TRigidBodyComponent({ mass: 1 }, createBoxCollider(1, 1, 1)),
    ]);

    const box2 = this.world.createEntity();
    this.world.addComponents(box2, [
      new TTransformComponent(new TTransform(vec3.fromValues(-0.1, 10, 0.6))),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TVisibilityComponent(),
      new TRigidBodyComponent(
        { mass: 1 },
        createBoxCollider(1, 1, 1, 'CustomClass'),
      ),
    ]);

    const box3 = this.world.createEntity();
    this.world.addComponents(box3, [
      new TTransformComponent(new TTransform(vec3.fromValues(0.6, 3, 0.2))),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TVisibilityComponent(),
      new TRigidBodyComponent({ mass: 1 }, createBoxCollider(1, 1, 1)),
    ]);

    const sphereMesh = createSphereMesh(0.5, 9, 12);

    const sphere = this.world.createEntity();
    this.world.addComponents(sphere, [
      new TTransformComponent(new TTransform(vec3.fromValues(-0.1, 8, 0.6))),
      new TMeshComponent({ source: 'inline', geometry: sphereMesh.geometry }),
      new TMaterialComponent(sphereMesh.material),
      new TVisibilityComponent(),
      new TRigidBodyComponent(
        { mass: 1 },
        createSphereCollider(0.5, 'NoCollide'),
      ),
    ]);

    const planeMesh = createPlaneMesh(10, 10);

    const plane = this.world.createEntity();
    this.world.addComponents(plane, [
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

    this.events.addListener(
      TEventTypesPhysics.COLLISION_START,
      'CustomClass',
      (event: TCollisionStartEvent) => {
        if (event.payload.entityA === box) {
          console.log('Collision started', event);
        }
      },
    );
  }
}

const config = {
  states: {
    game: ColliderState,
  },
  defaultState: 'game',
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
