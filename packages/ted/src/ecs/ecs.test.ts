import { TECS } from './ecs';
import { TComponent } from './component';

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
