import { vec3 } from 'gl-matrix';
import {
  TGameState,
  TEngine,
  createBoxCollider,
  createBoxMesh,
  createPlaneCollider,
  createPlaneMesh,
  setPlayerInputMapping,
  TActiveCameraComponent,
  TCameraComponent,
  TMaterialComponent,
  TMeshComponent,
  TMouseInputComponent,
  TMouseInputSystem,
  TOrbitCameraComponent,
  TOrbitCameraSystem,
  TPlayerInputComponent,
  TPlayerInputSystem,
  TProjectionType,
  TRigidBodyComponent,
  TShouldRenderComponent,
  TTransform,
  TTransformComponent,
  TEventTypesPhysics,
  TCollisionStartEvent,
} from '@tedengine/ted';
import {
  PlayerMovementSystem,
  PlayerMovementComponent,
} from '../shared/player-movement';

class TriggerState extends TGameState {
  public async beforeWorldCreate() {
    this.world?.config.collisionClasses.push({
      name: 'Trigger',
    });
  }

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

    setPlayerInputMapping(engine.inputManager);

    this.world.ecs.addSystem(
      new TPlayerInputSystem(this.world.ecs, engine.inputManager),
    );

    this.world.ecs.addSystem(new PlayerMovementSystem(this.world.ecs));

    const boxMesh = createBoxMesh(1, 1, 1);
    const box = this.world.ecs.createEntity();
    this.world.ecs.addComponents(box, [
      new TTransformComponent(new TTransform(vec3.fromValues(-0.1, 10, 0.6))),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TShouldRenderComponent(),
      new TRigidBodyComponent({ mass: 1 }, createBoxCollider(1, 1, 1)),
      new TPlayerInputComponent(),
      new PlayerMovementComponent(),
    ]);

    const trigger = this.world.ecs.createEntity();
    this.world.ecs.addComponents(trigger, [
      new TTransformComponent(new TTransform(vec3.fromValues(0, 0.6, 0))),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TShouldRenderComponent(),
      new TRigidBodyComponent(
        { mass: 0, isTrigger: true },
        createBoxCollider(1, 1, 1, 'Trigger'),
      ),
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

    this.events.addListener(
      TEventTypesPhysics.COLLISION_START,
      'Trigger',
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
    game: TriggerState,
  },
  defaultState: 'game',
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
