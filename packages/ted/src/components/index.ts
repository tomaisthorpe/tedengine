import TTransform from '../math/transform';
import { TComponent } from '../core/component';
import type { TEntity } from '../core/world';
import { TBundle } from '../core/bundle';

export enum TVisibilityState {
  Visible = 'visible',
  Hidden = 'hidden',
}

export class TVisibilityComponent extends TComponent {
  constructor(public state: TVisibilityState = TVisibilityState.Visible) {
    super();
  }
}

export class TTransformComponent extends TComponent {
  constructor(public transform: TTransform = new TTransform()) {
    super();
  }
}

export const TTransformBundle = TBundle.fromComponents([TTransformComponent]);

export class TMeshReadyComponent extends TComponent {}

export class TTexturedMeshReadyComponent extends TComponent {}

export class TSpriteReadyComponent extends TComponent {}

export class TParentEntityComponent extends TComponent {
  constructor(public entity: TEntity) {
    super();
  }
}
