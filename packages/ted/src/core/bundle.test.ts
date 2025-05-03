import { TBundle } from './bundle';
import { TComponent } from './component';
import TWorld from './world';

// Test components
class TestComponentA extends TComponent {
  constructor(public value = 5) {
    super();
  }
}

class TestComponentB extends TComponent {
  constructor(public value: string) {
    super();
  }
}

describe('TBundle', () => {
  let world: TWorld;
  let mockEngine: any;
  let mockGameState: any;

  beforeEach(() => {
    mockEngine = {};
    mockGameState = {};
    world = new TWorld(mockEngine, mockGameState);
  });

  describe('createEntity', () => {
    it('should create an entity with default components', () => {
      const bundle = TBundle.fromComponents([TestComponentA, TestComponentB]);
      const entity = bundle.createEntity(world);

      const components = world.getComponents(entity);
      expect(components).toBeDefined();
      expect(components?.has(TestComponentA)).toBe(true);
      expect(components?.has(TestComponentB)).toBe(true);
    });

    it('should create an entity with default values', () => {
      const bundle = TBundle.fromComponents([TestComponentA]).withComponent(
        TestComponentB,
        () => new TestComponentB('default'),
      );

      const entity = bundle.createEntity(world);
      const components = world.getComponents(entity);

      expect(components?.get(TestComponentA).value).toBe(5); // Default from constructor
      expect(components?.get(TestComponentB).value).toBe('default'); // From withComponent
    });

    it('should apply component overrides', () => {
      const bundle = TBundle.fromComponents([TestComponentA]).withComponent(
        TestComponentA,
        () => new TestComponentA(10),
      );

      const entity = bundle.createEntity(world, [new TestComponentA(20)]);
      const components = world.getComponents(entity);

      expect(components?.get(TestComponentA).value).toBe(20); // Override takes precedence
    });
  });

  describe('withComponent', () => {
    it('should add a new component type and return a new bundle', () => {
      const bundle = TBundle.fromComponents([TestComponentA]);

      const newBundle = bundle.withComponent(
        TestComponentB,
        () => new TestComponentB('default'),
      );

      expect(newBundle).not.toBe(bundle);

      const entity = newBundle.createEntity(world);
      const components = world.getComponents(entity);

      expect(components?.has(TestComponentA)).toBe(true);
      expect(components?.has(TestComponentB)).toBe(true);
    });

    it('should set default values for added components', () => {
      const bundle = TBundle.fromComponents([TestComponentA]).withComponent(
        TestComponentB,
        () => new TestComponentB('custom'),
      );

      const entity = bundle.createEntity(world);
      const components = world.getComponents(entity);

      expect(components?.get(TestComponentB).value).toBe('custom');
    });
  });

  describe('merge', () => {
    it('should combine component types from both bundles', () => {
      const bundle1 = TBundle.fromComponents([TestComponentA]);
      const bundle2 = TBundle.fromComponents([TestComponentB]);

      const merged = bundle1.merge(bundle2);
      const entity = merged.createEntity(world);
      const components = world.getComponents(entity);

      expect(components?.has(TestComponentA)).toBe(true);
      expect(components?.has(TestComponentB)).toBe(true);
    });

    it('should handle duplicate component types', () => {
      const bundle1 = TBundle.fromComponents([TestComponentA]).withComponent(
        TestComponentA,
        () => new TestComponentA(10),
      );

      const bundle2 = TBundle.fromComponents([TestComponentA]).withComponent(
        TestComponentA,
        () => new TestComponentA(20),
      );

      const merged = bundle1.merge(bundle2);
      const entity = merged.createEntity(world);
      const components = world.getComponents(entity);

      expect(components?.get(TestComponentA).value).toBe(20); // bundle2's default takes precedence
    });

    it('should preserve default values from both bundles', () => {
      const bundle1 = TBundle.fromComponents([TestComponentA]).withComponent(
        TestComponentA,
        () => new TestComponentA(10),
      );

      const bundle2 = TBundle.fromComponents([TestComponentB]).withComponent(
        TestComponentB,
        () => new TestComponentB('from bundle2'),
      );

      const merged = bundle1.merge(bundle2);
      const entity = merged.createEntity(world);
      const components = world.getComponents(entity);

      expect(components?.get(TestComponentA).value).toBe(10);
      expect(components?.get(TestComponentB).value).toBe('from bundle2');
    });
  });

  describe('fromComponents', () => {
    it('should create a bundle with the given components', () => {
      const bundle = TBundle.fromComponents([TestComponentA, TestComponentB]);
      const entity = bundle.createEntity(world);
      const components = world.getComponents(entity);

      expect(components?.has(TestComponentA)).toBe(true);
      expect(components?.has(TestComponentB)).toBe(true);
    });

    it('should create components with their default constructors', () => {
      const bundle = TBundle.fromComponents([TestComponentA]);
      const entity = bundle.createEntity(world);
      const components = world.getComponents(entity);

      expect(components?.get(TestComponentA).value).toBe(5); // Default from constructor
    });
  });
});
