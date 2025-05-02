import type { TComponentConstructor } from './component';
import type TWorld from './world';

export class TEntityQuery {
  private excludedComponents: TComponentConstructor[] = [];

  constructor(
    private world: TWorld,
    private components: TComponentConstructor[],
  ) {}

  public excludes(components: TComponentConstructor[]): TEntityQuery {
    this.excludedComponents.push(...components);
    return this;
  }

  public execute(): number[] {
    return this.world.queryEntities(this.components, this.excludedComponents);
  }
}
