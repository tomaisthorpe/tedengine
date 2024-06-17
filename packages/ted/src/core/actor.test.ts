import TActorComponent from '../actor-components/actor-component';
import TActor from './actor';

describe('TActor', () => {
  describe('destroy', () => {
    test('should set the "dead" flag to true', () => {
      const actor = new TActor();
      actor.destroy();
      expect(actor.dead).toBe(true);
    });

    test('should call the "destroy" method on each component', () => {
      const actor = new TActor();
      const component1 = new TActorComponent(actor);
      component1.destroy = jest.fn();

      const component2 = new TActorComponent(actor);
      component2.destroy = jest.fn();

      actor.destroy();
      expect(component1.destroy).toHaveBeenCalled();
      expect(component2.destroy).toHaveBeenCalled();
    });

    test('should call the "onDestroy" method if available', () => {
      const actor = new TActor() as any;
      actor.onDestroy = jest.fn();
      actor.destroy();
      expect(actor.onDestroy).toHaveBeenCalled();
    });

    test('should only call the "onDestroy" method once if destory is called multiple times', () => {
      const actor = new TActor() as any;
      actor.onDestroy = jest.fn();
      actor.destroy();
      actor.destroy();
      expect(actor.onDestroy).toHaveBeenCalledTimes(1);
    });

    test('should remove the actor from the world if it exists', () => {
      const actor = new TActor();
      const world = { removeActor: jest.fn() };
      actor.world = world as any;
      actor.destroy();
      expect(world.removeActor).toHaveBeenCalledWith(actor);
    });
  });
});
