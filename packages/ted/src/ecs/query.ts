import type { TComponentConstructor } from './component';
import type { TECS, TEntity } from './ecs';

export default class TECSQuery {
  constructor(
    private readonly ecs: TECS,
    private readonly components: TComponentConstructor[],
  ) {}

  private excludedComponents: TComponentConstructor[] = [];

  public excludes(components: TComponentConstructor[]): TECSQuery {
    this.excludedComponents = components;
    return this;
  }

  public execute(): TEntity[] {
    return this.ecs.queryEntities(this.components, this.excludedComponents);
  }
}
