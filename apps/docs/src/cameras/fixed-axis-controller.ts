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
  TFixedAxisCameraController,
  TOrbitCamera,
} from '@tedengine/ted';
import type { TController, TActorWithOnUpdate } from '@tedengine/ted';

class Cube extends TPawn implements TActorWithOnUpdate {
  private speed = 10;
  private isDown: { [key: string]: boolean } = {};

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
    this.controller?.update();

    const force = vec3.fromValues(0, 0, 0);

    if (this.isDown['left']) {
      force[0] -= this.speed;
    }

    if (this.isDown['right']) {
      force[0] += this.speed;
    }

    if (this.isDown['up']) {
      force[2] -= this.speed;
    }

    if (this.isDown['down']) {
      force[2] += this.speed;
    }

    this.rootComponent.applyCentralForce(force);
  }

  public setupController(controller: TController): void {
    super.setupController(controller);

    controller.bindAction('Up', 'pressed', this.pressed('up').bind(this));
    controller.bindAction('Up', 'released', this.released('up').bind(this));
    controller.bindAction('Left', 'pressed', this.pressed('left').bind(this));
    controller.bindAction('Left', 'released', this.released('left').bind(this));
    controller.bindAction('Down', 'pressed', this.pressed('down').bind(this));
    controller.bindAction('Down', 'released', this.released('down').bind(this));
    controller.bindAction('Right', 'pressed', this.pressed('right').bind(this));
    controller.bindAction(
      'Right',
      'released',
      this.released('right').bind(this),
    );
  }

  private pressed(key: string) {
    return () => {
      this.isDown[key] = true;
    };
  }

  private released(key: string) {
    return () => {
      this.isDown[key] = false;
    };
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
    this.addActor(camera);
    // this.activeCamera = camera;
    camera.cameraComponent.showDebugCamera(engine);

    const orbitCamera = new TOrbitCamera(engine, 20);
    orbitCamera.speed = 0.1;
    orbitCamera.cameraComponent.showDebug = true;
    this.addActor(orbitCamera);
    this.activeCamera = orbitCamera;

    const controller = new TFixedAxisCameraController({
      distance: 5,
      axis: 'z',
    });
    controller.attachTo(box.rootComponent);
    camera.controller = controller;

    this.activeCamera = camera;

    const section = engine.debugPanel.addSection('Fixed Axis Controller', true);
    section.addSelect(
      'Axis',
      [
        { label: 'X', value: 'x' },
        { label: 'Y', value: 'y' },
        { label: 'Z', value: 'z' },
      ],
      'z',
      (axis: string) => {
        controller.axis = axis;
      },
    );
    section.addInput(
      'Distance',
      'range',
      '5',
      (value) => {
        controller.distance = parseFloat(value);
      },
      {
        min: 2,
        max: 30,
        step: 0.1,
        showValueBubble: true,
      },
    );
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
