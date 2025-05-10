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
  TVisibilityComponent,
  TTransform,
  TTransformBundle,
} from '@tedengine/ted';
import type { TWorld, TEntityQuery } from '@tedengine/ted';

class PointerLockSystem extends TSystem {
  private query: TEntityQuery;
  constructor(private world: TWorld) {
    super();
    this.query = this.world.createQuery([
      TMouseInputComponent,
      TTransformComponent,
    ]);
  }

  public async update(engine: TEngine, world: TWorld): Promise<void> {
    const entities = this.query.execute();
    for (const entity of entities) {
      const mouseInputComponent = world
        .getComponents(entity)
        ?.get(TMouseInputComponent);
      const transform = world.getComponents(entity)?.get(TTransformComponent);
      if (mouseInputComponent.mouseMovement) {
        const loc = world.cameraSystem?.clipToWorldSpace(
          mouseInputComponent.mouseMovement.clip,
        );
        transform.transform.translation = vec3.fromValues(loc[0], loc[1], -10);
      }
    }
  }
}

class PointerLockState extends TGameState {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    this.world.addSystem(
      new TMouseInputSystem(this.world, engine.inputManager),
    );
    this.world.addSystem(new PointerLockSystem(this.world));

    const mesh = createBoxMesh(100, 100, 2);
    const entity = this.world.createEntity();
    this.world.addComponents(entity, [
      TTransformBundle.with(
        new TTransformComponent(new TTransform(vec3.fromValues(100, 100, -10))),
      ),
      new TMouseInputComponent(),
      new TMeshComponent({ source: 'inline', geometry: mesh.geometry }),
      new TMaterialComponent(mesh.material),
      new TVisibilityComponent(),
    ]);

    // Setup orthographic camera
    const cameraEntity = this.world.createEntity();
    this.world.addComponents(cameraEntity, [
      TTransformBundle,
      new TCameraComponent({
        type: TProjectionType.Orthographic,
        zNear: 0.1,
        zFar: 100,
      }),
    ]);
    this.world.cameraSystem.setActiveCamera(cameraEntity);

    engine.inputManager.enablePointerLock();
  }
}

const config = {
  states: {
    game: PointerLockState,
  },
  defaultState: 'game',
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
