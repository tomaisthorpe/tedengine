import { quat, vec3 } from 'gl-matrix';
import {
  TGameState,
  TEngine,
  TSpriteComponent,
  TOriginPoint,
  TResourcePack,
  TTopDownInputSystem,
  TTextureComponent,
  TShouldRenderComponent,
  TTransform,
  TTransformComponent,
  TTopDownInputComponent,
  TMouseInputComponent,
  TMouseInputSystem,
  TSystem,
} from '@tedengine/ted';
import type { TECS, TECSQuery, TTexture, TWorld } from '@tedengine/ted';
import asteroidTexture from '@assets/asteroid.png';

class TopDownRotatorSystem extends TSystem {
  private query: TECSQuery;

  constructor(private ecs: TECS) {
    super();

    this.query = ecs.createQuery([TTopDownInputComponent, TTransformComponent]);
  }

  public async update(): Promise<void> {
    const entities = this.query.execute();

    for (const entity of entities) {
      const topDownInputComponent = this.ecs
        .getComponents(entity)
        ?.get(TTopDownInputComponent);

      const transform = this.ecs
        .getComponents(entity)
        ?.get(TTransformComponent);

      if (!topDownInputComponent || !transform) {
        continue;
      }

      const q = quat.fromEuler(
        quat.create(),
        0,
        0,
        (topDownInputComponent.angle * 180) / Math.PI + 90,
      );

      transform.transform.rotation = q;
    }
  }
}

class TopDownState extends TGameState {
  public beforeWorldCreate() {
    this.world!.config.gravity = vec3.fromValues(0, 0, 0);
    this.world!.config.mode = '2d';
  }

  public async onCreate(engine: TEngine) {
    const rp = new TResourcePack(engine, {
      textures: [asteroidTexture],
    });

    await rp.load();

    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    this.world.ecs.addSystem(
      new TMouseInputSystem(this.world.ecs, engine.inputManager),
    );
    this.world.ecs.addSystem(new TTopDownInputSystem(this.world.ecs));
    this.world.ecs.addSystem(new TopDownRotatorSystem(this.world.ecs));
    const asteroid = this.world.ecs.createEntity();
    this.world.ecs.addComponents(asteroid, [
      new TTransformComponent(new TTransform(vec3.fromValues(0, 0, -3))),
      new TSpriteComponent({
        width: 1,
        height: 1,
        origin: TOriginPoint.Center,
      }),
      new TTextureComponent(engine.resources.get<TTexture>(asteroidTexture)!),
      new TShouldRenderComponent(),
      new TMouseInputComponent(),
      new TTopDownInputComponent(),
    ]);
  }
}

const config = {
  states: {
    game: TopDownState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
