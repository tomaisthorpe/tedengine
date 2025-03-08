import type { TComponentConstructor } from './component';
import type { TECS, TEntity } from './ecs';

export default class TECSQuery {
  constructor(
    private readonly ecs: TECS,
    private readonly components: TComponentConstructor[],
  ) {}

  public execute(): TEntity[] {
    return this.ecs.queryEntities(this.components);
  }
}
