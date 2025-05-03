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

  describe('subscriptions', () => {
    it('should notify subscribers of changes', () => {
      const mockWorld = {
        queryEntities: jest
          .fn()
          .mockReturnValueOnce([1, 2]) // First call
          .mockReturnValueOnce([1, 3]), // Second call
      };

      const query = new TEntityQuery(mockWorld as any, [TestComponentA]);
      const callback = jest.fn();
      query.subscribe(callback);

      // First execute - added entities
      query.execute();
      expect(callback).toHaveBeenCalledWith({
        added: [1, 2],
        removed: [],
      });

      // Second execute - changed entities
      query.execute();
      expect(callback).toHaveBeenCalledWith({
        added: [3],
        removed: [2],
      });
    });

    it('should allow unsubscribing', () => {
      const mockWorld = {
        queryEntities: jest
          .fn()
          .mockReturnValueOnce([1])
          .mockReturnValueOnce([2]),
      };

      const query = new TEntityQuery(mockWorld as any, [TestComponentA]);
      const callback = jest.fn();
      const unsubscribe = query.subscribe(callback);

      // First execute - added entities
      query.execute();
      expect(callback).toHaveBeenCalledWith({
        added: [1],
        removed: [],
      });

      callback.mockReset();

      // Unsubscribe
      unsubscribe();

      // Second execute - no callback should be called
      query.execute();
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle multiple subscribers', () => {
      const mockWorld = {
        queryEntities: jest
          .fn()
          .mockReturnValueOnce([1])
          .mockReturnValueOnce([2]),
      };

      const query = new TEntityQuery(mockWorld as any, [TestComponentA]);
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      query.subscribe(callback1);
      query.subscribe(callback2);

      // First execute - added entities
      query.execute();
      expect(callback1).toHaveBeenCalledWith({
        added: [1],
        removed: [],
      });
      expect(callback2).toHaveBeenCalledWith({
        added: [1],
        removed: [],
      });

      // Second execute - both callbacks should be called
      query.execute();
      expect(callback1).toHaveBeenCalledWith({
        added: [2],
        removed: [1],
      });
      expect(callback2).toHaveBeenCalledWith({
        added: [2],
        removed: [1],
      });
    });
  });
});
