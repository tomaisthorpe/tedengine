import { TParentEntityComponent, TTransformComponent } from '.';
import {
  TGlobalTransformComponent,
  TGlobalTransformSystem,
} from './global-transform';
import TWorld from '../core/world';
import TTransform from '../math/transform';
import type TEngine from '../engine/engine';
import type TGameState from '../core/game-state';
import { vec3 } from 'gl-matrix';

describe('TGlobalTransformSystem', () => {
  let mockEngine: TEngine;
  let mockGameState: TGameState;
  let world: TWorld;
  let system: TGlobalTransformSystem;

  beforeEach(() => {
    mockEngine = {} as TEngine;
    mockGameState = {} as TGameState;
    world = new TWorld(mockEngine, mockGameState);
    system = new TGlobalTransformSystem(world);
  });

  test('should set global transform equal to local transform for entities without parents', async () => {
    // Create entity with transform
    const localTransform = new TTransform();
    localTransform.translation = vec3.fromValues(1, 2, 3);

    const entity = world.createEntity();
    world.addComponent(entity, new TTransformComponent(localTransform));
    world.addComponent(entity, new TGlobalTransformComponent());

    // Run the system
    await system.update(mockEngine, world);

    // Check result
    const globalTransform = world.getComponent(
      entity,
      TGlobalTransformComponent,
    );
    expect(globalTransform?.transform?.translation).toEqual(
      vec3.fromValues(1, 2, 3),
    );
  });

  test('should correctly combine transforms for entities with parents', async () => {
    // Create parent entity with transform
    const parentTransform = new TTransform();
    parentTransform.translation = vec3.fromValues(1, 0, 0);

    const parentEntity = world.createEntity();
    world.addComponent(parentEntity, new TTransformComponent(parentTransform));
    world.addComponent(parentEntity, new TGlobalTransformComponent());

    // Create child entity with transform and reference to parent
    const childTransform = new TTransform();
    childTransform.translation = vec3.fromValues(0, 1, 0);

    const childEntity = world.createEntity();
    world.addComponent(childEntity, new TTransformComponent(childTransform));
    world.addComponent(childEntity, new TGlobalTransformComponent());
    world.addComponent(childEntity, new TParentEntityComponent(parentEntity));

    // Run the system
    await system.update(mockEngine, world);

    // Check result - child should be at (1,1,0)
    const childGlobalTransform = world.getComponent(
      childEntity,
      TGlobalTransformComponent,
    );
    expect(childGlobalTransform?.transform?.translation).toEqual(
      vec3.fromValues(1, 1, 0),
    );
  });

  test('should handle multi-level hierarchies correctly', async () => {
    // Create root entity at (5,0,0)
    const rootTransform = new TTransform();
    rootTransform.translation = vec3.fromValues(5, 0, 0);

    const rootEntity = world.createEntity();
    world.addComponent(rootEntity, new TTransformComponent(rootTransform));
    world.addComponent(rootEntity, new TGlobalTransformComponent());

    // Create parent entity at relative (0,5,0) to root
    const parentTransform = new TTransform();
    parentTransform.translation = vec3.fromValues(0, 5, 0);

    const parentEntity = world.createEntity();
    world.addComponent(parentEntity, new TTransformComponent(parentTransform));
    world.addComponent(parentEntity, new TGlobalTransformComponent());
    world.addComponent(parentEntity, new TParentEntityComponent(rootEntity));

    // Create child entity at relative (0,0,5) to parent
    const childTransform = new TTransform();
    childTransform.translation = vec3.fromValues(0, 0, 5);

    const childEntity = world.createEntity();
    world.addComponent(childEntity, new TTransformComponent(childTransform));
    world.addComponent(childEntity, new TGlobalTransformComponent());
    world.addComponent(childEntity, new TParentEntityComponent(parentEntity));

    // Run the system
    await system.update(mockEngine, world);

    // Check root global transform (should be same as local: 5,0,0)
    const rootGlobalTransform = world.getComponent(
      rootEntity,
      TGlobalTransformComponent,
    );
    expect(rootGlobalTransform?.transform?.translation).toEqual(
      vec3.fromValues(5, 0, 0),
    );

    // Check parent global transform (should be 5,5,0)
    const parentGlobalTransform = world.getComponent(
      parentEntity,
      TGlobalTransformComponent,
    );
    expect(parentGlobalTransform?.transform?.translation).toEqual(
      vec3.fromValues(5, 5, 0),
    );

    // Check child global transform (should be 5,5,5)
    const childGlobalTransform = world.getComponent(
      childEntity,
      TGlobalTransformComponent,
    );
    expect(childGlobalTransform?.transform?.translation).toEqual(
      vec3.fromValues(5, 5, 5),
    );
  });

  test('should handle circular references gracefully', async () => {
    // Create entity A
    const transformA = new TTransform();
    transformA.translation = vec3.fromValues(1, 0, 0);

    const entityA = world.createEntity();
    world.addComponent(entityA, new TTransformComponent(transformA));
    world.addComponent(entityA, new TGlobalTransformComponent());

    // Create entity B with A as parent
    const transformB = new TTransform();
    transformB.translation = vec3.fromValues(0, 1, 0);

    const entityB = world.createEntity();
    world.addComponent(entityB, new TTransformComponent(transformB));
    world.addComponent(entityB, new TGlobalTransformComponent());
    world.addComponent(entityB, new TParentEntityComponent(entityA));

    // Create circular reference by setting B as A's parent
    world.addComponent(entityA, new TParentEntityComponent(entityB));

    // Mock console.warn to check for circular reference warning
    const consoleSpy = jest.spyOn(console, 'warn');

    // Run the system
    await system.update(mockEngine, world);

    // Verify circular reference was detected
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Circular reference detected'),
      expect.anything(),
    );

    consoleSpy.mockRestore();
  });

  test('should process entities in correct order regardless of creation order', async () => {
    // Create child entity FIRST
    const childTransform = new TTransform();
    childTransform.translation = vec3.fromValues(0, 1, 0);

    const childEntity = world.createEntity();
    world.addComponent(childEntity, new TTransformComponent(childTransform));
    world.addComponent(childEntity, new TGlobalTransformComponent());

    // Then create parent entity
    const parentTransform = new TTransform();
    parentTransform.translation = vec3.fromValues(1, 0, 0);

    const parentEntity = world.createEntity();
    world.addComponent(parentEntity, new TTransformComponent(parentTransform));
    world.addComponent(parentEntity, new TGlobalTransformComponent());

    // Set parent reference AFTER both entities exist
    world.addComponent(childEntity, new TParentEntityComponent(parentEntity));

    // Run the system
    await system.update(mockEngine, world);

    // Check result - child should still have correct global transform (1,1,0)
    const childGlobalTransform = world.getComponent(
      childEntity,
      TGlobalTransformComponent,
    );
    expect(childGlobalTransform?.transform?.translation).toEqual(
      vec3.fromValues(1, 1, 0),
    );
  });
});
