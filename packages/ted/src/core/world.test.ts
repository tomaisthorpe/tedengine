/* eslint-disable @typescript-eslint/no-empty-function */
import TWorld from './world';
import { TComponent } from './component';
import { TSystem } from './system';
import type TEngine from '../engine/engine';
import type TGameState from './game-state';

class TestComponent extends TComponent {
  constructor(public value: number) {
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
