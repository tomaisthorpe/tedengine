import { vec3 } from 'gl-matrix';
import {
  TGameState,
  TEngine,
  TMouseInputSystem,
  createBoxCollider,
  createPlaneCollider,
  TActiveCameraComponent,
  TCameraComponent,
  TMaterialComponent,
  TMeshComponent,
  TMouseInputComponent,
  TPlayerInputComponent,
  TPlayerInputSystem,
  TProjectionType,
  TRigidBodyComponent,
  TVisibilityComponent,
  TTransform,
  TTransformComponent,
  TFixedAxisCameraTargetComponent,
  TFixedAxisCameraComponent,
  createBoxMesh,
  createPlaneMesh,
  setPlayerInputMapping,
  TFixedAxisCameraSystem,
} from '@tedengine/ted';
import {
  PlayerMovementSystem,
  PlayerMovementComponent,
} from '../shared/player-movement';

class ColliderState extends TGameState {
  activeCamera: any;
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    this.world.addSystem(
      new TMouseInputSystem(this.world, engine.inputManager),
    );

    setPlayerInputMapping(engine.inputManager);

    this.world.addSystem(
      new TPlayerInputSystem(this.world, engine.inputManager),
    );

    this.world.addSystem(new PlayerMovementSystem(this.world));

    this.world.addSystem(new TFixedAxisCameraSystem(this.world));

    const boxMesh = createBoxMesh(1, 1, 1);
    const box = this.world.createEntity();
    this.world.addComponents(box, [
      new TTransformComponent(new TTransform(vec3.fromValues(0, 5, 0))),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TVisibilityComponent(),
      new TRigidBodyComponent({ mass: 1 }, createBoxCollider(1, 1, 1)),
      new TPlayerInputComponent(),
      new PlayerMovementComponent(),
      new TFixedAxisCameraTargetComponent(),
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

    const fixedComponent = new TFixedAxisCameraComponent({
      distance: 5,
      axis: 'z',
      leadFactor: 50,
      maxLead: 0.9,
      lerpFactor: 0.9,
    });

    this.world.addComponents(perspective, [
      perspectiveComponent,
      new TTransformComponent(new TTransform(vec3.fromValues(0, 2, 5))),
      new TActiveCameraComponent(),
      new TMouseInputComponent(),
      fixedComponent,
    ]);

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
        fixedComponent.axis = axis;
      },
    );
    section.addInput(
      'Distance',
      'range',
      '5',
      (value) => {
        fixedComponent.distance = parseFloat(value);
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
