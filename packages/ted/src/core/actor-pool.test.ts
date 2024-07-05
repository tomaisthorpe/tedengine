import type { TPoolableActor } from '../core/actor-pool';
import TActorPool from '../core/actor-pool';
import TActor from './actor';

class TestActor extends TActor implements TPoolableActor {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public reset(): void {}

  public pool!: TActorPool<TPoolableActor>;
}

describe('TActorPool', () => {
  let actorPool: TActorPool<TPoolableActor>;

  beforeEach(() => {
    actorPool = new TActorPool<TPoolableActor>(() => {
      const actor = new TestActor();
      actor.reset = jest.fn();
      actor.destroy = jest.fn();
      actor.world = { removeActor: jest.fn() } as any;
      return actor;
    }, 5);
  });

  afterEach(() => {
    actorPool.destroy();
  });

  test('should acquire an actor from the pool', () => {
    const actor = actorPool.acquire();

    expect(actor).toBeDefined();
    expect(actor?.pool).toBe(actorPool);
  });

  test('should initialize a new actor if the pool is empty', () => {
    // Acquire all actors from the pool to empty it
    for (let i = 0; i < 5; i++) {
      actorPool.acquire();
    }

    const actor = actorPool.acquire();

    expect(actor).toBeDefined();
    expect(actor?.pool).toBe(actorPool);
  });

  test('should release an actor back to the pool', () => {
    const actor = actorPool.acquire();
    actorPool.release(actor!);

    expect(actor?.reset).toHaveBeenCalled();
    expect(actor?.world?.removeActor).toHaveBeenCalledWith(actor);
  });

  test('should destroy all actors remaining in the pool', () => {
    const actors: TPoolableActor[] = [];

    // Get a reference to all actors in the pool
    // This is used to check if they were destroyed
    for (let i = 0; i < 5; i++) {
      const actor = actorPool.acquire();
      actors.push(actor!);
      actorPool.release(actor!);
    }

    actorPool.destroy();

    for (const actor of actors) {
      expect(actor.destroy).toHaveBeenCalled();
    }

    expect(actorPool.dead).toBe(true);

    // We'd expect the pool to be empty after destroying all actors
    // And it should not be possible to acquire any more actors
    expect(actorPool.acquire()).toBeUndefined();
  });
});
