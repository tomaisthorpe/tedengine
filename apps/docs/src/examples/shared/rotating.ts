import {
  TComponent,
  TEngine,
  TSystem,
  TTransformComponent,
  TWorld,
  TEntityQuery,
} from '@tedengine/ted';
import { vec3 } from 'gl-matrix';

export class TRotatingComponent extends TComponent {
  constructor(
    public speed: vec3 = vec3.fromValues(0, 0.5, 0.5 * 0.7),
    public paused = false,
  ) {
    super();
  }
}

export class TRotatingSystem extends TSystem {
  private query: TEntityQuery;

  public constructor(world: TWorld) {
    super();

    this.query = world.createQuery([TTransformComponent, TRotatingComponent]);
  }

  public async update(
    engine: TEngine,
    world: TWorld,
    delta: number,
  ): Promise<void> {
    const entities = this.query.execute();

    for (const entity of entities) {
      const components = world.getComponents(entity);
      const transform = components.get(TTransformComponent);
      const rotating = components.get(TRotatingComponent);

      if (rotating.paused) {
        continue;
      }

      if (transform && rotating) {
        transform.transform.rotateX(delta * rotating.speed[0]);
        transform.transform.rotateY(delta * rotating.speed[1]);
        transform.transform.rotateZ(delta * rotating.speed[2]);
      }
    }
  }
}
