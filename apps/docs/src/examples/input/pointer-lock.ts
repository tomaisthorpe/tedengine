import { vec3 } from 'gl-matrix';
import {
  TGameState,
  TEngine,
  TMouseInputComponent,
  TTransformComponent,
  TSystem,
  createBoxMesh,
  TCameraComponent,
  TMaterialComponent,
  TMeshComponent,
  TMouseInputSystem,
  TProjectionType,
  TShouldRenderComponent,
  TTransform,
} from '@tedengine/ted';
import type { TWorld, TECS, TECSQuery } from '@tedengine/ted';

class PointerLockSystem extends TSystem {
  private query: TECSQuery;
  constructor(private ecs: TECS) {
    super();

    this.query = this.ecs.createQuery([
      TMouseInputComponent,
      TTransformComponent,
    ]);
  }

  public async update(engine: TEngine, world: TWorld): Promise<void> {
    const entities = this.query.execute();

    for (const entity of entities) {
      const mouseInputComponent = this.ecs
        .getComponents(entity)
        ?.get(TMouseInputComponent);
      const transform = this.ecs
        .getComponents(entity)
        ?.get(TTransformComponent);

      if (mouseInputComponent.mouseMovement) {
        const loc = world.cameraSystem?.clipToWorldSpace(
          mouseInputComponent.mouseMovement.clip,
        );
        transform.transform.translation = vec3.fromValues(loc[0], loc[1], -10);
      }
    }
  }
}

class ColliderState extends TGameState {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    this.world.ecs.addSystem(
      new TMouseInputSystem(this.world.ecs, engine.inputManager),
    );

    this.world.ecs.addSystem(new PointerLockSystem(this.world.ecs));

    const mesh = createBoxMesh(100, 100, 2);

    const entity = this.world.ecs.createEntity();
    this.world.ecs.addComponents(entity, [
      new TMouseInputComponent(),
      new TMeshComponent({ source: 'inline', geometry: mesh.geometry }),
      new TMaterialComponent(mesh.material),
      new TTransformComponent(new TTransform(vec3.fromValues(100, 100, -10))),
      new TShouldRenderComponent(),
    ]);

    // Setup orthographic camera
    const cameraEntity = this.world.ecs.createEntity();
    this.world.ecs.addComponents(cameraEntity, [
      new TCameraComponent({
        type: TProjectionType.Orthographic,
        zNear: 0.1,
        zFar: 100,
      }),
      new TTransformComponent(new TTransform()),
    ]);
    this.world.cameraSystem.setActiveCamera(cameraEntity);

    engine.inputManager.enablePointerLock();
  }
}

const config = {
  states: {
    game: ColliderState,
  },
  defaultState: 'game',
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
