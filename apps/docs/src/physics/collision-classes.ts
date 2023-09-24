import { vec3 } from 'gl-matrix';
import {
  TBoxComponent,
  TGameState,
  TActor,
  TOrbitCamera,
  TPlaneComponent,
  TPlaneCollider,
  TSphereComponent,
  TSphereCollider,
  TBoxCollider,
  TEngine,
} from '@tedengine/ted';

class Cube extends TActor {
  constructor(engine: TEngine, x: number, y: number, z: number) {
    super();

    const box = new TBoxComponent(engine, this, 1, 1, 1);
    this.rootComponent = box;
    this.rootComponent.collider = new TBoxCollider(1, 1, 1);

    this.rootComponent.transform.translation = vec3.fromValues(x, y, z);
  }
}

class Sphere extends TActor {
  constructor(engine: TEngine, x: number, y: number, z: number) {
    super();

    const box = new TSphereComponent(engine, this, 0.5, 9, 12);
    this.rootComponent = box;
    this.rootComponent.collider = new TSphereCollider(0.5, 'NoCollide');

    this.rootComponent.transform.translation = vec3.fromValues(x, y, z);
  }
}

class Plane extends TActor {
  constructor(engine: TEngine) {
    super();

    const box = new TPlaneComponent(engine, this, 10, 10);
    this.rootComponent = box;
    this.rootComponent.collider = new TPlaneCollider(10, 10);
    this.rootComponent.mass = 0;

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

    const box2 = new Cube(engine, -0.1, 10, 0.6);
    this.addActor(box2);

    const box3 = new Cube(engine, 0.6, 3, 0.2);
    this.addActor(box3);

    const sphere = new Sphere(engine, -0.1, 8, 0.6);
    this.addActor(sphere);

    const plane = new Plane(engine);
    this.addActor(plane);

    const orbitCamera = new TOrbitCamera(engine, 20);
    orbitCamera.speed = 0.5;
    orbitCamera.cameraComponent.showDebug = true;
    this.addActor(orbitCamera);
    this.activeCamera = orbitCamera;
  }
}

const config = {
  states: {
    game: ColliderState,
  },
  defaultState: 'game',
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
