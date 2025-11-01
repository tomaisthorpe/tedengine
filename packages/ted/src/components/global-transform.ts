import { TParentEntityComponent, TTransformComponent } from '.';
import { TBundle } from '../core/bundle';
import { TComponent } from '../core/component';
import type { TEntityQuery } from '../core/entity-query';
import { TSystem, TSystemPriority } from '../core/system';
import type { TWorld } from '../core/world';
import type { TEngine } from '../engine/engine';
import type { TTransform } from '../math/transform';

export class TGlobalTransformComponent extends TComponent {
  public transform?: TTransform;
}

export class TGlobalTransformSystem extends TSystem {
  public static readonly systemName: string = 'TGlobalTransformSystem';
  private query: TEntityQuery;
  public priority = TSystemPriority.Last;

  constructor(world: TWorld) {
    super();

    this.query = world.createQuery([
      TTransformComponent,
      TGlobalTransformComponent,
    ]);
  }

  public async update(_: TEngine, world: TWorld) {
    const entities = this.query.execute();

    // Step 1: Create a map of entities to their parent entities
    const parentMap = new Map<number, number>();
    // Step 2: Identify root entities (those without parents)
    const rootEntities = new Set<number>();

    // Build the hierarchy maps
    for (const entity of entities) {
      const components = world.getComponents(entity);
      if (!components) continue;

      if (components.has(TParentEntityComponent)) {
        const parent = components.get(TParentEntityComponent);
        if (parent) {
          parentMap.set(entity, parent.entity);
        }
      } else {
        rootEntities.add(entity);
      }
    }

    // Step 3: Process entities in hierarchy order (parents before children)
    const processed = new Set<number>();

    // First process all root entities
    for (const entity of rootEntities) {
      this.processEntity(entity, world, processed);
    }

    // Then process any remaining entities that might not be connected to roots
    for (const entity of entities) {
      if (!processed.has(entity)) {
        this.processEntity(entity, world, processed);
      }
    }
  }

  private processEntity(
    entity: number,
    world: TWorld,
    processed: Set<number>,
    visited: Set<number> = new Set<number>(),
  ) {
    // Detect circular references
    if (visited.has(entity)) {
      console.warn('Circular reference detected in entity hierarchy:', entity);
      return;
    }
    visited.add(entity);

    const components = world.getComponents(entity);
    if (!components) return;

    const transform = components.get(TTransformComponent);
    const globalTransform = components.get(TGlobalTransformComponent);

    if (!transform || !globalTransform) return;

    // If this entity has a parent, process the parent first
    if (components.has(TParentEntityComponent)) {
      const parent = components.get(TParentEntityComponent);

      if (!parent) return;

      // If parent hasn't been processed yet, process it first
      if (!processed.has(parent.entity)) {
        this.processEntity(parent.entity, world, processed, visited);
      }

      // Get the parent's global transform
      const parentComponents = world.getComponents(parent.entity);
      const parentGlobalTransform = parentComponents?.get(
        TGlobalTransformComponent,
      );

      if (parentGlobalTransform && parentGlobalTransform.transform) {
        // Combine parent's global transform with this entity's local transform
        globalTransform.transform = parentGlobalTransform.transform.add(
          transform.transform,
        );
      } else {
        // If parent doesn't have a global transform, just use local transform
        globalTransform.transform = transform.transform;
      }
    } else {
      // Root entity - global transform equals local transform
      globalTransform.transform = transform.transform;
    }

    // Mark this entity as processed
    processed.add(entity);
  }
}

export const TTransformBundle = TBundle.fromComponents([
  TTransformComponent,
  TGlobalTransformComponent,
]);
