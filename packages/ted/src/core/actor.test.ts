import TActorComponent from '../actor-components/actor-component';
import TSceneComponent from '../actor-components/scene-component';
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

  describe('getRenderTasks', () => {
    test('should return an empty array if actor has no components', () => {
      const actor = new TActor();
      const tasks = actor.getRenderTasks();
      expect(tasks).toEqual([]);
    });

    test('should return an array of render tasks for components that should render', () => {
      const actor = new TActor();
      const component1 = new TSceneComponent(actor);
      component1.shouldRender = true;
      component1.getRenderTask = jest.fn().mockReturnValue({ id: 'task1' });

      const component2 = new TSceneComponent(actor);
      component2.shouldRender = false;
      component2.getRenderTask = jest.fn().mockReturnValue({ id: 'task2' });

      const component3 = new TSceneComponent(actor);
      component3.shouldRender = true;
      component3.getRenderTask = jest.fn().mockReturnValue({ id: 'task3' });

      const tasks = actor.getRenderTasks();
      expect(tasks).toEqual([{ id: 'task1' }, { id: 'task3' }]);
    });
  });
});
