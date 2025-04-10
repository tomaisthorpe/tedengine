import { vec3 } from 'gl-matrix';
import {
  TGameState,
  TEngine,
  TMouseInputComponent,
  createBoxCollider,
  createBoxMesh,
  createPlaneCollider,
  createPlaneMesh,
  setPlayerInputMapping,
  TActiveCameraComponent,
  TCameraComponent,
  TMaterialComponent,
  TMeshComponent,
  TMouseInputSystem,
  TOrbitCameraSystem,
  TPlayerInputComponent,
  TPlayerInputSystem,
  TProjectionType,
  TRigidBodyComponent,
  TShouldRenderComponent,
  TTransform,
  TTransformComponent,
  TFollowComponentCameraComponent,
  TFollowComponentCameraSystem,
} from '@tedengine/ted';
import {
  PlayerMovementSystem,
  PlayerMovementComponent,
} from '../shared/player-movement';

class ColliderState extends TGameState {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    this.world.ecs.addSystem(
      new TMouseInputSystem(this.world.ecs, engine.inputManager),
    );

    setPlayerInputMapping(engine.inputManager);

    this.world.ecs.addSystem(
      new TPlayerInputSystem(this.world.ecs, engine.inputManager),
    );

    this.world.ecs.addSystem(new PlayerMovementSystem(this.world.ecs));

    this.world.ecs.addSystem(new TFollowComponentCameraSystem(this.world.ecs));

    const boxMesh = createBoxMesh(1, 1, 1);
    const box = this.world.ecs.createEntity();
    this.world.ecs.addComponents(box, [
      new TTransformComponent(new TTransform(vec3.fromValues(0, 5, 0))),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TShouldRenderComponent(),
      new TRigidBodyComponent({ mass: 1 }, createBoxCollider(1, 1, 1)),
      new TPlayerInputComponent(),
      new PlayerMovementComponent(),
      new TFollowComponentCameraComponent(),
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
      new TTransformComponent(new TTransform(vec3.fromValues(0, 2, 5))),
      new TActiveCameraComponent(),
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
