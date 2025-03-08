import type TTransform from '../math/transform';
import { TComponent } from '../ecs/component';
import type { TEntity } from '../ecs/ecs';

export class TShouldRenderComponent extends TComponent {}

export class TTransformComponent extends TComponent {
  constructor(public transform: TTransform) {
    super();
  }
}

export class TMeshReadyComponent extends TComponent {}

export class TTexturedMeshReadyComponent extends TComponent {}

export class TSpriteReadyComponent extends TComponent {}

export class TParentEntityComponent extends TComponent {
  constructor(public entity: TEntity) {
    super();
  }
}
