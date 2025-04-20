/* eslint-disable @typescript-eslint/no-empty-function */
import { TECS } from './ecs';
import { TComponent } from './component';
import { TSystem } from './system';
import type TWorld from '../core/world';
import type TEngine from '../engine/engine';

class TestComponent extends TComponent {
  constructor(public value: number) {
    super();
  }
}

test('should create an ECS instance', () => {
  const ecs = new TECS();
  expect(ecs).toBeDefined();
});

describe('createEntity', () => {
  test('should return successive entity ids', () => {
    const ecs = new TECS();
    const entity = ecs.createEntity();
    expect(entity).toBe(0);

    const entity2 = ecs.createEntity();
    expect(entity2).toBe(1);
  });
});

describe('addComponent', () => {
  test('should add a component to an entity', () => {
    const ecs = new TECS();
    const entity = ecs.createEntity();
    ecs.addComponent(entity, new TestComponent(1));
    expect(ecs.getComponents(entity)?.has(TestComponent)).toBe(true);
  });

  test('adding a component twice will replace the existing component', () => {
    const ecs = new TECS();
    const entity = ecs.createEntity();
    ecs.addComponent(entity, new TestComponent(1));
    ecs.addComponent(entity, new TestComponent(2));
    expect(ecs.getComponents(entity)?.has(TestComponent)).toBe(true);
    expect(ecs.getComponents(entity)?.get(TestComponent)?.value).toBe(2);
  });
});

describe('removeComponent', () => {
  test('should remove a component from an entity', () => {
    const ecs = new TECS();
    const entity = ecs.createEntity();
    ecs.addComponent(entity, new TestComponent(1));
    ecs.removeComponent(entity, TestComponent);
    expect(ecs.getComponents(entity)?.has(TestComponent)).toBe(false);
  });
});

class FirstSystem extends TSystem {
  public readonly priority: number = 1;
  public async update(
    engine: TEngine,
    world: TWorld,
    ecs: TECS,
    delta: number,
  ): Promise<void> {}
}

class SecondSystem extends TSystem {
  public readonly priority: number = 2;
  public async update(
    engine: TEngine,
    world: TWorld,
    ecs: TECS,
    delta: number,
  ): Promise<void> {}
}

class ThirdSystem extends TSystem {
  public readonly priority: number = 3;
  public async update(
    engine: TEngine,
    world: TWorld,
    ecs: TECS,
    delta: number,
  ): Promise<void> {}
}

describe('addSystem', () => {
  test('should call systems in order of priority', () => {
    const system1 = new FirstSystem();
    const system2 = new SecondSystem();
    const system3 = new ThirdSystem();

    const ecs = new TECS();
    ecs.addSystem(system1);
    ecs.addSystem(system2);
    ecs.addSystem(system3);

    const spy1 = jest.spyOn(system1, 'update');
    const spy2 = jest.spyOn(system2, 'update');
    const spy3 = jest.spyOn(system3, 'update');

    ecs.update({} as any, {} as any, 1);

    expect(spy1).toHaveBeenCalledBefore(spy2);
    expect(spy2).toHaveBeenCalledBefore(spy3);
  });
});
