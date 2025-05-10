/* eslint-disable @typescript-eslint/no-empty-function */
import TWorld from './world';
import { TComponent } from './component';
import { TSystem } from './system';
import type TEngine from '../engine/engine';
import type TGameState from './game-state';
import { TBundle } from './bundle';

class TestComponent extends TComponent {
  constructor(public value: number) {
    super();
  }
}

class TestComponent2 extends TComponent {
  constructor(public value: string) {
    super();
  }
}

test('should create a World instance', () => {
  const mockEngine = {} as TEngine;
  const mockGameState = {} as TGameState;
  const world = new TWorld(mockEngine, mockGameState);
  expect(world).toBeDefined();
});

describe('createEntity', () => {
  test('should return successive entity ids', () => {
    const mockEngine = {} as TEngine;
    const mockGameState = {} as TGameState;
    const world = new TWorld(mockEngine, mockGameState);
    const entity = world.createEntity();
    expect(entity).toBe(0);

    const entity2 = world.createEntity();
    expect(entity2).toBe(1);
  });

  test('should create entity with components', () => {
    const mockEngine = {} as TEngine;
    const mockGameState = {} as TGameState;
    const world = new TWorld(mockEngine, mockGameState);

    const entity = world.createEntity([
      new TestComponent(1),
      new TestComponent2('test'),
    ]);

    const components = world.getComponents(entity);
    expect(components?.has(TestComponent)).toBe(true);
    expect(components?.get(TestComponent)?.value).toBe(1);
    expect(components?.has(TestComponent2)).toBe(true);
    expect(components?.get(TestComponent2)?.value).toBe('test');
  });

  test('should create entity with bundle', () => {
    const mockEngine = {} as TEngine;
    const mockGameState = {} as TGameState;
    const world = new TWorld(mockEngine, mockGameState);

    const bundle = TBundle.fromComponents([TestComponent]).withComponent(
      TestComponent2,
      () => new TestComponent2('from bundle'),
    );

    const entity = world.createEntity([bundle]);

    const components = world.getComponents(entity);
    expect(components?.has(TestComponent)).toBe(true);
    expect(components?.get(TestComponent)?.value).toBeUndefined(); // Default value
    expect(components?.has(TestComponent2)).toBe(true);
    expect(components?.get(TestComponent2)?.value).toBe('from bundle');
  });

  test('should create entity with mix of components and bundles', () => {
    const mockEngine = {} as TEngine;
    const mockGameState = {} as TGameState;
    const world = new TWorld(mockEngine, mockGameState);

    const bundle = TBundle.fromComponents([TestComponent]).withComponent(
      TestComponent2,
      () => new TestComponent2('from bundle'),
    );

    const entity = world.createEntity([
      bundle,
      new TestComponent(1),
      new TestComponent2('override'),
    ]);

    const components = world.getComponents(entity);
    expect(components?.has(TestComponent)).toBe(true);
    expect(components?.get(TestComponent)?.value).toBe(1); // From direct component
    expect(components?.has(TestComponent2)).toBe(true);
    expect(components?.get(TestComponent2)?.value).toBe('override'); // Direct component overrides bundle
  });
});

describe('addComponents', () => {
  test('should add multiple components to an entity', () => {
    const mockEngine = {} as TEngine;
    const mockGameState = {} as TGameState;
    const world = new TWorld(mockEngine, mockGameState);
    const entity = world.createEntity();
    world.addComponents(entity, [
      new TestComponent(1),
      new TestComponent2('test'),
    ]);
    expect(world.getComponents(entity)?.has(TestComponent)).toBe(true);
    expect(world.getComponents(entity)?.get(TestComponent)?.value).toBe(1);
    expect(world.getComponents(entity)?.has(TestComponent2)).toBe(true);
    expect(world.getComponents(entity)?.get(TestComponent2)?.value).toBe(
      'test',
    );
  });
});

describe('addComponent', () => {
  test('should add a component to an entity', () => {
    const mockEngine = {} as TEngine;
    const mockGameState = {} as TGameState;
    const world = new TWorld(mockEngine, mockGameState);
    const entity = world.createEntity();
    world.addComponent(entity, new TestComponent(1));
    expect(world.getComponents(entity)?.has(TestComponent)).toBe(true);
  });

  test('adding a component twice will replace the existing component', () => {
    const mockEngine = {} as TEngine;
    const mockGameState = {} as TGameState;
    const world = new TWorld(mockEngine, mockGameState);
    const entity = world.createEntity();
    world.addComponent(entity, new TestComponent(1));
    world.addComponent(entity, new TestComponent(2));
    expect(world.getComponents(entity)?.has(TestComponent)).toBe(true);
    expect(world.getComponents(entity)?.get(TestComponent)?.value).toBe(2);
  });
});

describe('removeComponent', () => {
  test('should remove a component from an entity', () => {
    const mockEngine = {} as TEngine;
    const mockGameState = {} as TGameState;
    const world = new TWorld(mockEngine, mockGameState);
    const entity = world.createEntity();
    world.addComponent(entity, new TestComponent(1));
    world.removeComponent(entity, TestComponent);
    expect(world.getComponents(entity)?.has(TestComponent)).toBe(false);
  });
});

describe('getComponents', () => {
  test('should return the correct components for an entity', () => {
    const mockEngine = {} as TEngine;
    const mockGameState = {} as TGameState;
    const world = new TWorld(mockEngine, mockGameState);
    const entity = world.createEntity();
    world.addComponents(entity, [
      new TestComponent(1),
      new TestComponent2('test'),
    ]);
    const components = world.getComponents(entity);
    expect(components?.has(TestComponent)).toBe(true);
    expect(components?.get(TestComponent)?.value).toBe(1);
    expect(components?.has(TestComponent2)).toBe(true);
    expect(components?.get(TestComponent2)?.value).toBe('test');
  });
});

describe('getComponent', () => {
  test('should return the correct component for an entity', () => {
    const mockEngine = {} as TEngine;
    const mockGameState = {} as TGameState;
    const world = new TWorld(mockEngine, mockGameState);
    const entity = world.createEntity();
    world.addComponent(entity, new TestComponent(1));
    const component = world.getComponent(entity, TestComponent);
    expect(component?.value).toBe(1);
  });
});

class FirstSystem extends TSystem {
  public readonly priority: number = 1;
  public async update(
    engine: TEngine,
    world: TWorld,
    delta: number,
  ): Promise<void> {}
}

class SecondSystem extends TSystem {
  public readonly priority: number = 2;
  public async update(
    engine: TEngine,
    world: TWorld,
    delta: number,
  ): Promise<void> {}
}

class ThirdSystem extends TSystem {
  public readonly priority: number = 3;
  public async update(
    engine: TEngine,
    world: TWorld,
    delta: number,
  ): Promise<void> {}
}

describe('addSystem', () => {
  test('should call systems in order of priority', async () => {
    const mockEngine = {} as TEngine;
    const mockGameState = {} as TGameState;
    const world = new TWorld(mockEngine, mockGameState);
    const system1 = new FirstSystem();
    const system2 = new SecondSystem();
    const system3 = new ThirdSystem();

    world.addSystem(system1);
    world.addSystem(system2);
    world.addSystem(system3);

    const spy1 = jest.spyOn(system1, 'update');
    const spy2 = jest.spyOn(system2, 'update');
    const spy3 = jest.spyOn(system3, 'update');

    await world.update(mockEngine, 1);

    // Verify that all systems were called
    expect(spy1).toHaveBeenCalledBefore(spy2);
    expect(spy2).toHaveBeenCalledBefore(spy3);
  });
});

describe('removeSystem', () => {
  test('should remove a system from the world', () => {
    const mockEngine = {} as TEngine;
    const mockGameState = {} as TGameState;
    const world = new TWorld(mockEngine, mockGameState);
    const system1 = new FirstSystem();
    const system2 = new SecondSystem();
    const system3 = new ThirdSystem();

    world.addSystem(system1);
    world.addSystem(system2);
    world.addSystem(system3);

    world.removeSystem(system2);

    expect(world.systems.length).toBe(2);
    expect(world.systems).not.toContain(system2);
  });
});

describe('queryEntities', () => {
  test('should return entities that match the given components', () => {
    const mockEngine = {} as TEngine;
    const mockGameState = {} as TGameState;
    const world = new TWorld(mockEngine, mockGameState);
    const entity1 = world.createEntity();
    const entity2 = world.createEntity();
    const entity3 = world.createEntity();

    world.addComponents(entity1, [new TestComponent(1)]);
    world.addComponents(entity2, [new TestComponent2('test')]);
    world.addComponents(entity3, [new TestComponent(3)]);

    const entities = world.queryEntities([TestComponent]);
    expect(entities).toEqual([entity1, entity3]);
  });

  test('should return entities that match the given components and exclude the given components', () => {
    const mockEngine = {} as TEngine;
    const mockGameState = {} as TGameState;
    const world = new TWorld(mockEngine, mockGameState);
    const entity1 = world.createEntity();
    const entity2 = world.createEntity();
    const entity3 = world.createEntity();

    world.addComponents(entity1, [new TestComponent(1)]);
    world.addComponents(entity2, [
      new TestComponent(2),
      new TestComponent2('test'),
    ]);
    world.addComponents(entity3, [new TestComponent(3)]);

    const entities = world.queryEntities([TestComponent], [TestComponent2]);
    expect(entities).toEqual([entity1, entity3]);
  });
});

describe('createQuery', () => {
  test('should create a query with the given components', () => {
    const mockEngine = {} as TEngine;
    const mockGameState = {} as TGameState;
    const world = new TWorld(mockEngine, mockGameState);
    const query = world.createQuery([TestComponent]);
    expect(query).toBeDefined();

    const entity1 = world.createEntity();
    const entity2 = world.createEntity();
    const entity3 = world.createEntity();

    world.addComponents(entity1, [new TestComponent(1)]);
    world.addComponents(entity2, [new TestComponent2('test')]);
    world.addComponents(entity3, [new TestComponent(3)]);

    const entities = query.execute();
    expect(entities).toEqual([entity1, entity3]);
  });
});
