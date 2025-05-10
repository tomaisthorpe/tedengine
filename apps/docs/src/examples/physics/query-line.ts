import { vec3 } from 'gl-matrix';
import type { TGameStateWithOnUpdate } from '@tedengine/ted';
import {
  TGameState,
  TEngine,
  createBoxCollider,
  createBoxMesh,
  TActiveCameraComponent,
  TCameraComponent,
  TMaterialComponent,
  TMeshComponent,
  TOrbitCameraComponent,
  TOrbitCameraSystem,
  TProjectionType,
  TRigidBodyComponent,
  TVisibilityComponent,
  TTransform,
  TTransformComponent,
  TTransformBundle,
  TMouseInputSystem,
  TMouseInputComponent,
} from '@tedengine/ted';

class ColliderState extends TGameState implements TGameStateWithOnUpdate {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public async beforeWorldCreate(engine: TEngine) {
    // Hook into before world create so that world config can be modified before it is created
    this.world!.config.gravity = vec3.fromValues(0, 0, 0);
  }

  public onReady(engine: TEngine) {
    this.world.addSystem(
      new TOrbitCameraSystem(this.world, engine.inputManager),
    );

    this.world.addSystem(
      new TMouseInputSystem(this.world, engine.inputManager),
    );

    const boxMesh = createBoxMesh(1, 1, 1);

    const box = this.world.createEntity();
    this.world.addComponents(box, [
      TTransformBundle.with(
        new TTransformComponent(new TTransform(vec3.fromValues(10, 0, 0))),
      ),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TVisibilityComponent(),
      new TRigidBodyComponent({ mass: 1 }, createBoxCollider(1, 1, 1)),
    ]);

    const box2 = this.world.createEntity();
    this.world.addComponents(box2, [
      TTransformBundle.with(
        new TTransformComponent(new TTransform(vec3.fromValues(-6, 0, 0))),
      ),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TVisibilityComponent(),
      new TRigidBodyComponent({ mass: 1 }, createBoxCollider(1, 1, 1)),
    ]);

    const box3 = this.world.createEntity();
    this.world.addComponents(box3, [
      TTransformBundle.with(
        new TTransformComponent(new TTransform(vec3.fromValues(6, 0, 0))),
      ),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TVisibilityComponent(),
      new TRigidBodyComponent(
        { mass: 1 },
        createBoxCollider(1, 1, 1, 'NoCollide'),
      ),
    ]);

    const perspective = this.world.createEntity();
    const perspectiveComponent = new TCameraComponent({
      type: TProjectionType.Perspective,
      fov: 45,
    });
    this.world.addComponents(perspective, [
      perspectiveComponent,
      TTransformBundle.with(
        new TTransformComponent(new TTransform(vec3.fromValues(0, 0, 0))),
      ),
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
