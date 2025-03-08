import {
  TComponent,
  TSystem,
  TECSQuery,
  TECS,
  TPlayerInputComponent,
  TTransformComponent,
  TEngine,
  TWorld,
} from '@tedengine/ted';
import { vec3 } from 'gl-matrix';

export class PlayerMovementComponent extends TComponent {}

export class PlayerMovementSystem extends TSystem {
  private query: TECSQuery;
  constructor(ecs: TECS) {
    super();

    this.query = new TECSQuery(ecs, [
      TPlayerInputComponent,
      PlayerMovementComponent,
      TTransformComponent,
    ]);
  }

  public async update(
    engine: TEngine,
    world: TWorld,
    ecs: TECS,
    delta: number,
  ): Promise<void> {
    const entities = this.query.execute();

    for (const entity of entities) {
      const input = ecs.getComponents(entity)?.get(TPlayerInputComponent);
      const transform = ecs.getComponents(entity)?.get(TTransformComponent);

      if (!input || !transform) continue;

      const force = vec3.fromValues(0, 0, 0);

      force[0] += input.moveDirection[0] * 10;
      force[2] -= input.moveDirection[1] * 10;

      world.applyCentralForce(entity, force);
    }
  }
}
