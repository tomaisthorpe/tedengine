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
  TMouseInputComponent,
  TMouseInputSystem,
  TOrbitCameraComponent,
  TOrbitCameraSystem,
  TProjectionType,
  TRigidBodyComponent,
  TShouldRenderComponent,
  TTransform,
  TTransformComponent,
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
    this.world.ecs.addSystem(
      new TOrbitCameraSystem(this.world.ecs, engine.inputManager),
    );

    this.world.ecs.addSystem(
      new TMouseInputSystem(this.world.ecs, engine.inputManager),
    );

    const boxMesh = createBoxMesh(1, 1, 1);

    const box = this.world.ecs.createEntity();
    this.world.ecs.addComponents(box, [
      new TTransformComponent(new TTransform(vec3.fromValues(10, 0, 0))),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TShouldRenderComponent(),
      new TRigidBodyComponent({ mass: 1 }, createBoxCollider(1, 1, 1)),
    ]);

    const box2 = this.world.ecs.createEntity();
    this.world.ecs.addComponents(box2, [
      new TTransformComponent(new TTransform(vec3.fromValues(-6, 0, 0))),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TShouldRenderComponent(),
      new TRigidBodyComponent({ mass: 1 }, createBoxCollider(1, 1, 1)),
    ]);

    const box3 = this.world.ecs.createEntity();
    this.world.ecs.addComponents(box3, [
      new TTransformComponent(new TTransform(vec3.fromValues(6, 0, 0))),
      new TMeshComponent({ source: 'inline', geometry: boxMesh.geometry }),
      new TMaterialComponent(boxMesh.material),
      new TShouldRenderComponent(),
      new TRigidBodyComponent(
        { mass: 1 },
        createBoxCollider(1, 1, 1, 'NoCollide'),
      ),
    ]);

    const perspective = this.world.ecs.createEntity();
    const perspectiveComponent = new TCameraComponent({
      type: TProjectionType.Perspective,
      fov: 45,
    });
    this.world.ecs.addComponents(perspective, [
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
