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
    this.rootComponent.collider = new TSphereCollider(0.5);

    this.rootComponent.transform.translation = vec3.fromValues(x, y, z);
  }
}

class Plane extends TActor {
  constructor(engine: TEngine) {
    super();
    const size = 40;

    const box = new TPlaneComponent(engine, this, size, size);
    this.rootComponent = box;
    this.rootComponent.collider = new TPlaneCollider(size, size);
    this.rootComponent.mass = 0;

    this.rootComponent.transform.translation = vec3.fromValues(0, 0, 0);
  }
}

class ColliderState extends TGameState {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const rows = 10;
    const cols = 10;
    const levels = 6;

    const spaceX = 18 / rows;
    const spaceZ = 18 / cols;
    const spaceY = 3;

    const maxJitter = 0.4;

    for (let l = 0; l < levels; l++) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const jitter = (Math.random() * 2 - 1) * maxJitter;
          const x = -9 + spaceX * c + jitter;
          const z = -9 + spaceZ * r + jitter;
          const y = 0.5 + spaceY * l + jitter;
          const box = new Cube(engine, x, y, z);
          this.addActor(box);
        }
      }
    }

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
  debugPanelOpen: true,
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
