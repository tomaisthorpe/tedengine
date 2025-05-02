import { TEntityQuery } from './entity-query';
import { TComponent } from './component';

// Mock components for testing
class TestComponentA extends TComponent {}
class TestComponentB extends TComponent {}
class TestComponentC extends TComponent {}

describe('TEntityQuery', () => {
  it('should pass required components to world query', () => {
    const mockWorld = {
      queryEntities: jest.fn().mockReturnValue([1, 2]),
    };

    const query = new TEntityQuery(mockWorld as any, [TestComponentA]);
    query.execute();

    expect(mockWorld.queryEntities).toHaveBeenCalledWith([TestComponentA], []);
  });

  it('should pass excluded components to world query', () => {
    const mockWorld = {
      queryEntities: jest.fn().mockReturnValue([1]),
    };

    const query = new TEntityQuery(mockWorld as any, [TestComponentA]).excludes(
      [TestComponentB],
    );
    query.execute();

    expect(mockWorld.queryEntities).toHaveBeenCalledWith(
      [TestComponentA],
      [TestComponentB],
    );
  });

  it('should return results from world query', () => {
    const expectedResults = [1, 2, 3];
    const mockWorld = {
      queryEntities: jest.fn().mockReturnValue(expectedResults),
    };

    const query = new TEntityQuery(mockWorld as any, [TestComponentA]);
    const results = query.execute();

    expect(results).toBe(expectedResults);
  });

  it('should chain exclude calls', () => {
    const mockWorld = {
      queryEntities: jest.fn().mockReturnValue([]),
    };

    const query = new TEntityQuery(mockWorld as any, [TestComponentA])
      .excludes([TestComponentB])
      .excludes([TestComponentC]);
    query.execute();

    expect(mockWorld.queryEntities).toHaveBeenCalledWith(
      [TestComponentA],
      [TestComponentB, TestComponentC],
    );
  });
});
