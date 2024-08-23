import { vec3 } from 'gl-matrix';
import {
  TBoxComponent,
  TGameState,
  TActor,
  TOrbitCamera,
  TPlaneComponent,
  TPlaneCollider,
  TBoxCollider,
  TEngine,
  TPawn,
  TSimpleController,
} from '@tedengine/ted';

class Cube extends TPawn {
  private speed = 10;

  constructor(
    engine: TEngine,
    gameState: TGameState,
    x: number,
    y: number,
    z: number,
  ) {
    super();

    const controller = new TSimpleController(gameState.events);
    controller.possess(this);

    const box = new TBoxComponent(engine, this, 1, 1, 1);
    this.rootComponent = box;
    this.rootComponent.collider = new TBoxCollider(1, 1, 1);

    this.rootComponent.transform.translation = vec3.fromValues(x, y, z);
  }

  onWorldAdd(engine: TEngine) {
    this.onEnterCollisionClass('Trigger', (hitActor: TActor) => {
      console.log('Collided with: Actor ', hitActor.uuid);
    });
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

class Trigger extends TActor {
  constructor(engine: TEngine, x: number, y: number, z: number) {
    super();

    const box = new TBoxComponent(engine, this, 1, 1, 1, {
      isTrigger: true,
      mass: 0,
    });
    this.rootComponent = box;
    this.rootComponent.collider = new TBoxCollider(1, 1, 1, 'Trigger');

    this.rootComponent.transform.translation = vec3.fromValues(x, y, z);
  }

  onWorldAdd(engine: TEngine) {
    this.onEnterCollisionClass('Solid', (hitActor: TActor) => {
      console.log('Triggered by: Actor ', hitActor.uuid);
    });
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
    const box = new Trigger(engine, 0, 0.6, 0);
    this.addActor(box);

    const box2 = new Cube(engine, this, -0.1, 10, 0.6);
    this.addActor(box2);

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
    game: TriggerState,
  },
  defaultState: 'game',
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
