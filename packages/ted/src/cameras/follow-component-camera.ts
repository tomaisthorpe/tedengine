import { TComponent } from '../ecs/component';
import { TTransformComponent } from '../components';
import type { TECS } from '../ecs/ecs';
import type TECSQuery from '../ecs/query';
import { TSystem, TSystemPriority } from '../ecs/system';
import { TActiveCameraComponent, TCameraComponent } from './camera-component';

export class TFollowComponentCameraComponent extends TComponent {}

export class TFollowComponentCameraSystem extends TSystem {
  public readonly priority: number = TSystemPriority.Update;

  private activeCameraQuery: TECSQuery;
  private targetQuery: TECSQuery;

  constructor(private ecs: TECS) {
    super();

    this.activeCameraQuery = ecs.createQuery([
      TCameraComponent,
      TActiveCameraComponent,
    ]);

    this.targetQuery = ecs.createQuery([
      TTransformComponent,
      TFollowComponentCameraComponent,
    ]);
  }

  public async update(): Promise<void> {
    const entities = this.activeCameraQuery.execute();

    for (const entity of entities) {
      const camera = this.ecs.getComponents(entity)?.get(TCameraComponent);
      const transform = this.ecs
        .getComponents(entity)
        ?.get(TTransformComponent);

      const targets = this.targetQuery.execute();
      if (targets.length === 0) {
        continue;
      }
      // Follow the first target
      const target = targets[0];

      if (!camera || target === undefined || !transform) {
        continue;
      }

      const targetTransform = this.ecs
        .getComponents(target)
        ?.get(TTransformComponent);
      if (!targetTransform) {
        continue;
      }

      transform.transform.lookAt(targetTransform.transform.translation);
    }
  }
}
