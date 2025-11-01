import { TComponent } from '../core/component';
import { TTransformComponent } from '../components';
import type { TEntityQuery } from '../core/entity-query';
import { TSystem, TSystemPriority } from '../core/system';
import { TActiveCameraComponent, TCameraComponent } from './camera-component';
import type { TWorld } from '../core/world';
import type { TEngine } from '../engine/engine';

export class TFollowComponentCameraComponent extends TComponent {}

export class TFollowComponentCameraSystem extends TSystem {
  public static readonly systemName: string = 'TFollowComponentCameraSystem';
  public readonly priority: number = TSystemPriority.Update;

  private activeCameraQuery: TEntityQuery;
  private targetQuery: TEntityQuery;

  constructor(world: TWorld) {
    super();

    this.activeCameraQuery = world.createQuery([
      TCameraComponent,
      TActiveCameraComponent,
    ]);

    this.targetQuery = world.createQuery([
      TTransformComponent,
      TFollowComponentCameraComponent,
    ]);
  }

  public async update(_: TEngine, world: TWorld): Promise<void> {
    const entities = this.activeCameraQuery.execute();

    for (const entity of entities) {
      const camera = world.getComponents(entity)?.get(TCameraComponent);
      const transform = world.getComponents(entity)?.get(TTransformComponent);

      const targets = this.targetQuery.execute();
      if (targets.length === 0) {
        continue;
      }
      // Follow the first target
      const target = targets[0];

      if (!camera || !transform) {
        continue;
      }

      const targetTransform = world
        .getComponents(target)
        ?.get(TTransformComponent);
      if (!targetTransform) {
        continue;
      }

      transform.transform.lookAt(targetTransform.transform.translation);
    }
  }
}
