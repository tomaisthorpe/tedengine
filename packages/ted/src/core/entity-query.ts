import type { TComponentConstructor } from './component';
import type { TWorld } from './world';

export type TEntityQueryChange = {
  added: number[];
  removed: number[];
};

export type TEntityQueryCallback = (changes: TEntityQueryChange) => void;

export class TEntityQuery {
  private excludedComponents: TComponentConstructor[] = [];
  private previousResults: number[] = [];
  private callbacks: TEntityQueryCallback[] = [];

  constructor(
    private world: TWorld,
    private components: TComponentConstructor[],
  ) {}

  public excludes(components: TComponentConstructor[]): TEntityQuery {
    this.excludedComponents.push(...components);
    return this;
  }

  public subscribe(callback: TEntityQueryCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index !== -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  public execute(): number[] {
    const currentResults = this.world.queryEntities(
      this.components,
      this.excludedComponents,
    );

    // Calculate changes
    const added = currentResults.filter(
      (id) => !this.previousResults.includes(id),
    );
    const removed = this.previousResults.filter(
      (id) => !currentResults.includes(id),
    );

    // Notify subscribers if there are changes
    if (added.length > 0 || removed.length > 0) {
      const changes: TEntityQueryChange = { added, removed };
      for (const callback of this.callbacks) {
        callback(changes);
      }
    }

    this.previousResults = currentResults;
    return currentResults;
  }
}
