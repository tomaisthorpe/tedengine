import { TComponent, TComponentContainer } from './component';

// Test components
class TestComponentA extends TComponent {
  constructor(public value: number) {
    super();
  }
}

class TestComponentB extends TComponent {
  constructor(public value: string) {
    super();
  }
}

describe('TComponent', () => {
  it('should be able to create a component', () => {
    const component = new TestComponentA(42);
    expect(component).toBeInstanceOf(TestComponentA);
    expect(component.value).toBe(42);
  });
});

describe('TComponentContainer', () => {
  let container: TComponentContainer;
  let componentA: TestComponentA;
  let componentB: TestComponentB;

  beforeEach(() => {
    container = new TComponentContainer();
    componentA = new TestComponentA(42);
    componentB = new TestComponentB('test');
  });

  it('should return undefined when getting a non-existent component', () => {
    expect(container.get(TestComponentA)).toBeUndefined();
  });

  it('should return the correct component when provided', () => {
    const container = new TComponentContainer([componentA, componentB]);
    expect(container.get(TestComponentA)).toBe(componentA);
    expect(container.get(TestComponentB)).toBe(componentB);
  });

  it('should add components', () => {
    container.add(componentA);
    expect(container.get(TestComponentA)).toBe(componentA);
  });

  it('should get components by their constructor', () => {
    container.add(componentA);
    const retrieved = container.get(TestComponentA);
    expect(retrieved).toBe(componentA);
    expect(retrieved.value).toBe(42);
  });

  it('should check if a component exists', () => {
    expect(container.has(TestComponentA)).toBe(false);
    container.add(componentA);
    expect(container.has(TestComponentA)).toBe(true);
  });

  it('should check if all components exist', () => {
    const components = [TestComponentA, TestComponentB];
    expect(container.hasAll(components)).toBe(false);

    container.add(componentA);
    expect(container.hasAll(components)).toBe(false);

    container.add(componentB);
    expect(container.hasAll(components)).toBe(true);
  });

  it('should check if any components exist', () => {
    const components = [TestComponentA, TestComponentB];
    expect(container.hasAny(components)).toBe(false);

    container.add(componentA);
    expect(container.hasAny(components)).toBe(true);
  });

  it('should remove components', () => {
    container.add(componentA);
    expect(container.has(TestComponentA)).toBe(true);

    container.remove(TestComponentA);
    expect(container.has(TestComponentA)).toBe(false);
  });

  it('should handle multiple components of different types', () => {
    container.add(componentA);
    container.add(componentB);

    expect(container.get(TestComponentA)).toBe(componentA);
    expect(container.get(TestComponentB)).toBe(componentB);
  });

  it('should handle component replacement', () => {
    const componentA1 = new TestComponentA(42);
    const componentA2 = new TestComponentA(100);

    container.add(componentA1);
    expect(container.get(TestComponentA)).toBe(componentA1);

    container.add(componentA2);
    expect(container.get(TestComponentA)).toBe(componentA2);
  });
});
