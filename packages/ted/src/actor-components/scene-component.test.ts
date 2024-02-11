import { TActor, TSceneComponent } from '../index';

describe('SceneComponent', () => {
  test('should attach to the root component', () => {
    const actor = new TActor();

    const sceneComponent = new TSceneComponent(actor);

    expect(sceneComponent.parentComponent?.uuid).toBe(actor.rootComponent.uuid);
  });

  test("shouldn't attach to root component if it is the root component", () => {
    // Actor automatically creates a root component
    const actor = new TActor();
    const rootComponent = actor.rootComponent;

    expect(rootComponent.parentComponent).toBeUndefined();
  });

  test('should set default physics body options', () => {
    const actor = new TActor();

    const sceneComponent = new TSceneComponent(actor);

    expect(sceneComponent.bodyOptions).toEqual({ mass: 1 });
  });

  test('should override default physics body options', () => {
    const actor = new TActor();
    const bodyOptions = { mass: 2 };

    const sceneComponent = new TSceneComponent(actor, bodyOptions);

    expect(sceneComponent.bodyOptions).toEqual(bodyOptions);
  });
});
