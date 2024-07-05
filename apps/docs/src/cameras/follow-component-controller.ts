import { vec3 } from 'gl-matrix';
import {
  TBoxComponent,
  TGameState,
  TActor,
  TPlaneComponent,
  TPlaneCollider,
  TBoxCollider,
  TEngine,
  TPawn,
  TSimpleController,
  TPerspectiveCamera,
  TOrbitCamera,
  TFollowComponentCameraController,
} from '@tedengine/ted';
import type { TActorWithOnUpdate } from '@tedengine/ted';

class Cube extends TPawn implements TActorWithOnUpdate {
  private speed = 10;

  constructor(engine: TEngine, x: number, y: number, z: number) {
    super();

    const controller = new TSimpleController(engine);
    controller.possess(this);

    const box = new TBoxComponent(engine, this, 1, 1, 1);
    this.rootComponent = box;
    this.rootComponent.collider = new TBoxCollider(1, 1, 1);

    this.rootComponent.transform.translation = vec3.fromValues(x, y, z);
  }

  async onUpdate(): Promise<void> {
    if (!this.controller) return;

    this.controller.update();

    const force = vec3.fromValues(0, 0, 0);

    force[0] += this.speed * this.controller.getAxisValue('Horizontal');
    force[2] -= this.speed * this.controller.getAxisValue('Vertical');

    this.rootComponent.applyCentralForce(force);
  }
}

class Plane extends TActor {
  constructor(engine: TEngine) {
    super();

    const box = new TPlaneComponent(engine, this, 10, 10, { mass: 0 });
    this.rootComponent = box;
    this.rootComponent.collider = new TPlaneCollider(10, 10);

    this.rootComponent.transform.translation = vec3.fromValues(0, 0, 0);
  }
}

class ColliderState extends TGameState {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const box = new Cube(engine, 0, 5, 0);
    this.addActor(box);

    const plane = new Plane(engine);
    this.addActor(plane);

    const camera = new TPerspectiveCamera(engine);
    camera.moveTo(vec3.fromValues(5, 5, 5), false);
    camera.lookAt(box.rootComponent.getWorldTransform().translation, false);
    this.addActor(camera);
    // this.activeCamera = camera;
    camera.cameraComponent.showDebugCamera(engine);

    const orbitCamera = new TOrbitCamera(engine, 20);
    orbitCamera.speed = 0.1;
    orbitCamera.cameraComponent.showDebug = true;
    this.addActor(orbitCamera);
    this.activeCamera = orbitCamera;

    const controller = new TFollowComponentCameraController();
    controller.attachTo(box.rootComponent);
    camera.controller = controller;

    this.activeCamera = camera;
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
