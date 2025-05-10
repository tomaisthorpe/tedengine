import { TBundle } from './bundle';
import { TComponent } from './component';

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
  describe('withComponent', () => {
    it('should add a new component type and return a new bundle', () => {
      const bundle = TBundle.fromComponents([TestComponentA]);
      const newBundle = bundle.withComponent(
        TestComponentB,
        () => new TestComponentB('default'),
      );

      expect(newBundle).not.toBe(bundle);

      const components = newBundle.createComponents();
      expect(components).toHaveLength(2);
      expect(components[0]).toBeInstanceOf(TestComponentA);
      expect(components[1]).toBeInstanceOf(TestComponentB);
    });

    it('should set default values for added components', () => {
      const bundle = TBundle.fromComponents([TestComponentA]).withComponent(
        TestComponentB,
        () => new TestComponentB('custom'),
      );

      const components = bundle.createComponents();
      expect(components).toHaveLength(2);
      expect((components[1] as TestComponentB).value).toBe('custom');
    });
  });

  describe('merge', () => {
    it('should combine component types from both bundles', () => {
      const bundle1 = TBundle.fromComponents([TestComponentA]);
      const bundle2 = TBundle.fromComponents([TestComponentB]);

      const merged = bundle1.merge(bundle2);
      const components = merged.createComponents();

      expect(components).toHaveLength(2);
      expect(components[0]).toBeInstanceOf(TestComponentA);
      expect(components[1]).toBeInstanceOf(TestComponentB);
    });

    it('should handle duplicate component types', () => {
      const bundle1 = TBundle.fromComponents([TestComponentA]);
      const bundle2 = TBundle.fromComponents([TestComponentA]).withComponent(
        TestComponentA,
        () => new TestComponentA(20),
      );

      const merged = bundle1.merge(bundle2);
      const components = merged.createComponents();

      expect(components).toHaveLength(1);
      expect((components[0] as TestComponentA).value).toBe(20); // bundle2's default takes precedence
    });

    it('should preserve default values from both bundles', () => {
      const bundle1 = TBundle.fromComponents([]).withComponent(
        TestComponentA,
        () => new TestComponentA(10),
      );
      const bundle2 = TBundle.fromComponents([]).withComponent(
        TestComponentB,
        () => new TestComponentB('from bundle2'),
      );

      const merged = bundle1.merge(bundle2);
      const components = merged.createComponents();

      expect(components).toHaveLength(2);
      expect((components[0] as TestComponentA).value).toBe(10);
      expect((components[1] as TestComponentB).value).toBe('from bundle2');
    });
  });

  describe('fromComponents', () => {
    it('should create a bundle with the given components', () => {
      const bundle = TBundle.fromComponents([TestComponentA, TestComponentB]);
      const components = bundle.createComponents();

      expect(components).toHaveLength(2);
      expect(components[0]).toBeInstanceOf(TestComponentA);
      expect(components[1]).toBeInstanceOf(TestComponentB);
    });

    it('should create components with their default constructors', () => {
      const bundle = TBundle.fromComponents([TestComponentA]);
      const components = bundle.createComponents();

      expect(components).toHaveLength(1);
      expect(components[0]).toBeInstanceOf(TestComponentA);
      expect((components[0] as TestComponentA).value).toBe(5); // Default from constructor
    });
  });

  describe('createComponents', () => {
    it('should create components with default constructors', () => {
      const bundle = TBundle.fromComponents([TestComponentA, TestComponentB]);
      const components = bundle.createComponents();

      expect(components).toHaveLength(2);
      expect(components[0]).toBeInstanceOf(TestComponentA);
      expect(components[1]).toBeInstanceOf(TestComponentB);
      expect((components[0] as TestComponentA).value).toBe(5); // Default from constructor
    });

    it('should create components with custom default values', () => {
      const bundle = TBundle.fromComponents([])
        .withComponent(TestComponentA, () => new TestComponentA(10))
        .withComponent(TestComponentB, () => new TestComponentB('custom'));

      const components = bundle.createComponents();

      expect(components).toHaveLength(2);
      expect(components[0]).toBeInstanceOf(TestComponentA);
      expect(components[1]).toBeInstanceOf(TestComponentB);
      expect((components[0] as TestComponentA).value).toBe(10); // Custom default
      expect((components[1] as TestComponentB).value).toBe('custom'); // Custom default
    });

    it('should maintain component order', () => {
      const bundle = TBundle.fromComponents([TestComponentA, TestComponentB]);
      const components = bundle.createComponents();

      expect(components[0]).toBeInstanceOf(TestComponentA);
      expect(components[1]).toBeInstanceOf(TestComponentB);
    });
  });
});
