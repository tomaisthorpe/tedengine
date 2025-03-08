import type TWorld from '../core/world';
import { TComponent } from '../ecs/component';
import { TTransformComponent } from '../components';
import type { TECS } from '../ecs/ecs';
import type TECSQuery from '../ecs/query';
import { TSystem } from '../ecs/system';
import type TEngine from '../engine/engine';
import { TMouseInputComponent } from './mouse-input';

export class TTopDownInputComponent extends TComponent {
  public angle = 0;
}

export class TTopDownInputSystem extends TSystem {
  private query: TECSQuery;

  constructor(private ecs: TECS) {
    super();

    this.query = ecs.createQuery([
      TMouseInputComponent,
      TTopDownInputComponent,
      TTransformComponent,
    ]);
  }

  public async update(engine: TEngine, world: TWorld): Promise<void> {
    const entities = this.query.execute();

    for (const entity of entities) {
      const mouseInputComponent = this.ecs
        .getComponents(entity)
        ?.get(TMouseInputComponent);
      const topDownInputComponent = this.ecs
        .getComponents(entity)
        ?.get(TTopDownInputComponent);
      const transform = this.ecs
        .getComponents(entity)
        ?.get(TTransformComponent);

      if (!mouseInputComponent || !topDownInputComponent || !transform) {
        continue;
      }

      if (!mouseInputComponent.mouseLocation) {
        continue;
      }

      const worldSpace = world.cameraSystem?.clipToWorldSpace(
        mouseInputComponent.mouseLocation.clip,
      );

      topDownInputComponent.angle = Math.atan2(
        worldSpace[1] - transform.transform.translation[1],
        worldSpace[0] - transform.transform.translation[0],
      );
    }
  }
}
