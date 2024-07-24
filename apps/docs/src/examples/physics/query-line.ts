import { vec3 } from 'gl-matrix';
import type { TGameStateWithOnUpdate } from '@tedengine/ted';
import {
  TBoxComponent,
  TGameState,
  TActor,
  TOrbitCamera,
  TBoxCollider,
  TEngine,
} from '@tedengine/ted';

class Cube extends TActor {
  constructor(
    engine: TEngine,
    x: number,
    y: number,
    z: number,
    collisionClass: string,
  ) {
    super();

    const box = new TBoxComponent(engine, this, 1, 1, 1);
    this.rootComponent = box;
    this.rootComponent.collider = new TBoxCollider(1, 1, 1, collisionClass);

    this.rootComponent.transform.translation = vec3.fromValues(x, y, z);
  }
}

class ColliderState extends TGameState implements TGameStateWithOnUpdate {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public async beforeWorldCreate(engine: TEngine) {
    // Hook into before world create so that world config can be modified before it is created
    this.world!.config.gravity = vec3.fromValues(0, 0, 0);
  }

  public onReady(engine: TEngine) {
    const box = new Cube(engine, 10, 0, 0, 'Solid');
    this.addActor(box);

    const box2 = new Cube(engine, -6, 0, 0, 'Solid');
    this.addActor(box2);

    const box3 = new Cube(engine, 6, 0, 0, 'NoCollide');
    this.addActor(box3);

    const orbitCamera = new TOrbitCamera(engine, 20);
    orbitCamera.speed = 0.5;
    orbitCamera.cameraComponent.showDebug = true;
    this.addActor(orbitCamera);
    this.activeCamera = orbitCamera;
  }

  public async onUpdate(engine: TEngine, delta: number): Promise<void> {
    const hits = await this.world?.queryLine(
      vec3.fromValues(0, 0.5, 0),
      vec3.fromValues(15, 0.5, 0),
      { collisionClasses: ['Solid'] },
    );

    console.log(hits);
  }
}

const config = {
  states: {
    game: ColliderState,
  },
  defaultState: 'game',
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
