import { TParentEntityComponent, TTransformComponent } from '.';
import { TBundle } from '../core/bundle';
import { TComponent } from '../core/component';
import type { TEntityQuery } from '../core/entity-query';
import { TSystem, TSystemPriority } from '../core/system';
import type TWorld from '../core/world';
import type TEngine from '../engine/engine';
import type TTransform from '../math/transform';

export class TGlobalTransformComponent extends TComponent {
  public transform?: TTransform;
}

export class TGlobalTransformSystem extends TSystem {
  private query: TEntityQuery;
  public priority = TSystemPriority.Last;

  constructor(world: TWorld) {
    super();

    this.query = world.createQuery([
      TTransformComponent,
      TGlobalTransformComponent,
    ]);
  }

  public async update(_: TEngine, world: TWorld) {
    const entities = this.query.execute();

    for (const entity of entities) {
      const components = world.getComponents(entity);
      if (!components) {
        continue;
      }

      const transform = components.get(TTransformComponent);
      const globalTransform = components.get(TGlobalTransformComponent);

      if (!transform || !globalTransform) {
        continue;
      }

      if (!components.has(TParentEntityComponent)) {
        globalTransform.transform = transform.transform;
        continue;
      }

      const parent = components.get(TParentEntityComponent);
      const parentTransform = world
        .getComponents(parent.entity)
        ?.get(TTransformComponent);

      if (!parentTransform) {
        continue;
      }

      globalTransform.transform = parentTransform.transform.add(
        transform.transform,
      );
    }
  }
}

export const TTransformBundle = TBundle.fromComponents([
  TTransformComponent,
  TGlobalTransformComponent,
]);
