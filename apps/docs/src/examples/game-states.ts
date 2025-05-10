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
  TVisibilityComponent,
  TTransform,
  TTransformComponent,
  TTransformBundle,
} from '@tedengine/ted';
import {
  PlayerMovementSystem,
  PlayerMovementComponent,
} from './shared/player-movement';

class GameState extends TGameState {
  public name = 'game';
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

    setPlayerInputMapping(engine.inputManager);

    this.world.addSystem(
      new TPlayerInputSystem(this.world, engine.inputManager),
    );

    this.world.addSystem(new PlayerMovementSystem(this.world));

    const boxMesh = createBoxMesh(1, 1, 1);
    const box = this.world.createEntity();
    this.world.addComponents(box, [
      TTransformBundle,
      new TTransformComponent(new TTransform(vec3.fromValues(0, 5, 0))),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TVisibilityComponent(),
      new TRigidBodyComponent({ mass: 1 }, createBoxCollider(1, 1, 1)),
      new TPlayerInputComponent(),
      new PlayerMovementComponent(),
    ]);
    const planeMesh = createPlaneMesh(10, 10);

    const plane = this.world.createEntity();
    this.world.addComponents(plane, [
      TTransformBundle,
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
      TTransformBundle,
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

    const section = engine.debugPanel.addSection('Game States', true);
    section.addButtons(
      'Change States',
      {
        label: 'Push',
        onClick: () => {
          engine.gameState.push('game2');
        },
      },
      {
        label: 'Pop',
        onClick: () => {
          engine.gameState.pop();
        },
      },
    );
  }
}
class DupeState extends TGameState {
  public name = 'dupe';
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

    setPlayerInputMapping(engine.inputManager);

    this.world.addSystem(
      new TPlayerInputSystem(this.world, engine.inputManager),
    );

    this.world.addSystem(new PlayerMovementSystem(this.world));

    const boxMesh = createBoxMesh(1, 1, 1);
    const box = this.world.createEntity();
    this.world.addComponents(box, [
      TTransformBundle,
      new TTransformComponent(new TTransform(vec3.fromValues(0, 5, 0))),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TVisibilityComponent(),
      new TRigidBodyComponent({ mass: 1 }, createBoxCollider(1, 1, 1)),
      new TPlayerInputComponent(),
      new PlayerMovementComponent(),
    ]);
    const planeMesh = createPlaneMesh(10, 10);

    const plane = this.world.createEntity();
    this.world.addComponents(plane, [
      TTransformBundle,
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
      TTransformBundle,
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
  }
}

const config = {
  states: {
    game: GameState,
    game2: DupeState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
