import type TActor from './actor';

export interface TPoolableActor extends TActor {
  /**
   * Resets the actor to its initial state
   */
  reset(): void;

  pool: TActorPool<TPoolableActor>;

  /**
   * Set to true when the actor is acquired from the pool
   */
  acquired: boolean;
}

export default class TActorPool<T extends TPoolableActor> {
  private actors: T[] = [];
  public dead = false;

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
    if (this.dead) return;

    if (this.actors.length === 0) {
      const actor = this.actor();

      actor.pool = this;
      actor.acquired = true;

      return actor;
    }

    const actor = this.actors.pop();
    if (!actor) return;

    actor.acquired = true;
    return actor;
  }

  /**
   * Releases actor back to the pool, resets and removes it from the world
   * @param actor
   */
  public release(actor: T): void {
    actor.reset();
    actor.acquired = false;

    if (actor.world) {
      actor.world.removeActor(actor);
    }

    this.actors.push(actor);
  }

  /**
   * Runs destroy all actors remaining in the pool.
   * This will not destroy actors that have been acquired.
   *
   * Once this method is called, the pool is no longer usable.
   */
  public destroy(): void {
    if (this.dead) return;

    this.dead = true;

    for (const actor of this.actors) {
      actor.destroy();
    }

    this.actors = [];
  }
}
