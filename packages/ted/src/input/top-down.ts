import { TComponent } from '../core/component';
import type { TWorld } from '../core/world';
import { TTransformComponent } from '../components';
import type { TEntityQuery } from '../core/entity-query';
import { TSystem, TSystemPriority } from '../core/system';
import type { TEngine } from '../engine/engine';
import { TMouseInputComponent } from './mouse-input';

export class TTopDownInputComponent extends TComponent {
  public angle = 0;
}

export class TTopDownInputSystem extends TSystem {
  public static readonly systemName: string = 'TTopDownInputSystem';
  public readonly priority: number = TSystemPriority.Update;

  private query: TEntityQuery;

  constructor(private world: TWorld) {
    super();

    this.query = world.createQuery([
      TMouseInputComponent,
      TTopDownInputComponent,
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
      const mouseInputComponent = world
        .getComponents(entity)
        ?.get(TMouseInputComponent);
      const topDownInputComponent = world
        .getComponents(entity)
        ?.get(TTopDownInputComponent);
      const transform = world.getComponents(entity)?.get(TTransformComponent);

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
