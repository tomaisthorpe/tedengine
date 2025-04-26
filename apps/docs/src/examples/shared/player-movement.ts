import {
  TComponent,
  TSystem,
  TPlayerInputComponent,
  TTransformComponent,
  TEngine,
  TWorld,
  TEntityQuery,
} from '@tedengine/ted';
import { vec3 } from 'gl-matrix';

export class PlayerMovementComponent extends TComponent {}

export class PlayerMovementSystem extends TSystem {
  private query: TEntityQuery;
  constructor(world: TWorld) {
    super();

    this.query = world.createQuery([
      TPlayerInputComponent,
      PlayerMovementComponent,
      TTransformComponent,
    ]);
  }

  public async update(
    engine: TEngine,
    world: TWorld,
    delta: number,
  ): Promise<void> {
    const entities = this.query.execute();

    for (const entity of entities) {
      const input = world.getComponent(entity, TPlayerInputComponent);
      const transform = world.getComponent(entity, TTransformComponent);

      if (!input || !transform) continue;

      const force = vec3.fromValues(0, 0, 0);

      force[0] += input.moveDirection[0] * 10;
      force[2] -= input.moveDirection[1] * 10;

      world.applyCentralForce(entity, force);
    }
  }
}
