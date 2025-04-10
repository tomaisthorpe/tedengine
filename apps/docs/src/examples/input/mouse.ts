import { vec3 } from 'gl-matrix';
import {
  TGameState,
  TEngine,
  TMouseInputSystem,
  TMouseInputComponent,
  TTransform,
  TSystem,
  createBoxMesh,
  TMaterialComponent,
  TMeshComponent,
  TShouldRenderComponent,
  TTransformComponent,
  TCameraComponent,
  TProjectionType,
  TInputDevice,
} from '@tedengine/ted';
import type { TECS, TECSQuery, TWorld, TInputManager } from '@tedengine/ted';

class MouseClickSystem extends TSystem {
  private query: TECSQuery;
  constructor(
    private ecs: TECS,
    private inputManager: TInputManager,
  ) {
    super();

    this.query = this.ecs.createQuery([TMouseInputComponent]);

    inputManager.mapInput('click', {
      device: TInputDevice.Mouse,
      key: '0',
    });
  }

  public async update(engine: TEngine, world: TWorld): Promise<void> {
    const entities = this.query.execute();

    for (const entity of entities) {
      const mouseInputComponent = this.ecs
        .getComponents(entity)
        ?.get(TMouseInputComponent);

      if (this.inputManager.wasActionJustPressed('click')) {
        console.log(
          `You clicked on the game at (${mouseInputComponent.mouseLocation?.clip[0]},${mouseInputComponent.mouseLocation?.clip[1]})!`,
        );
      }
    }
  }
}

class FollowMouseSystem extends TSystem {
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

      if (mouseInputComponent.mouseLocation) {
        const loc = world.cameraSystem?.clipToWorldSpace(
          mouseInputComponent.mouseLocation.clip,
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

    this.world.ecs.addSystem(
      new MouseClickSystem(this.world.ecs, engine.inputManager),
    );

    this.world.ecs.addSystem(new FollowMouseSystem(this.world.ecs));

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
  }
}

const config = {
  states: {
    game: ColliderState,
  },
  defaultState: 'game',
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
