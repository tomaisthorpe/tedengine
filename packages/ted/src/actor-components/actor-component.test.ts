import TActorComponent from '../actor-components/actor-component';
import TActor from '../core/actor';

describe('TActorComponent', () => {
  describe('destroy', () => {
    test('should call the "onDestroy" method if available', () => {
      const onDestroyMock = jest.fn();
      const actor = new TActor();
      const actorComponent = new TActorComponent(actor) as any;
      actorComponent.onDestroy = onDestroyMock;
      actorComponent.destroy();

      expect(onDestroyMock).toHaveBeenCalled();
      expect(actorComponent.dead).toBe(true);
    });

    test('should only call the "onDestroy" method once if destroy is called multiple times', () => {
      const onDestroyMock = jest.fn();
      const actor = new TActor();
      const actorComponent = new TActorComponent(actor) as any;
      actorComponent.onDestroy = onDestroyMock;
      actorComponent.destroy();
      actorComponent.destroy();

      expect(onDestroyMock).toHaveBeenCalledTimes(1);
    });
  });
});
