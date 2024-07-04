import type TActor from './actor';

export interface TPoolableActor extends TActor {
  /**
   * Resets the actor to its initial state
   */
  reset(): void;

  pool: TActorPool<TPoolableActor>;
}

export default class TActorPool<T extends TPoolableActor> {
  private actors: T[] = [];

  constructor(
    // Function that creates a new actor
    private readonly actor: () => T,
    startingInstances: number,
  ) {
    // Prefill the pool with instances
    for (let i = 0; i < startingInstances; i++) {
      const actor = this.actor();
      actor.pool = this;

      this.actors.push(actor);
    }
  }

  /**
   * Acquires an actor from the pool, and initializes a new one if necessary
   * @returns
   */
  public acquire(): T | undefined {
    if (this.actors.length === 0) {
      const actor = this.actor();
      actor.pool = this;
      return actor;
    }

    return this.actors.pop();
  }

  /**
   * Releases actor back to the pool, resets and removes it from the world
   * @param actor
   */
  public release(actor: T): void {
    actor.reset();

    if (actor.world) {
      actor.world.removeActor(actor);
    }

    this.actors.push(actor);
  }

  /**
   * Runs destroy all actors remaining in the pool.
   * This will not destroy actors that have been acquired.
   */
  public destroy(): void {
    for (const actor of this.actors) {
      actor.destroy();
    }

    this.actors = [];
  }
}
