import type TWorld from '../core/world';
import type TEngine from '../engine/engine';
import type { TComponent, TComponentConstructor } from './component';
import { TComponentContainer } from './component';
import TECSQuery from './query';
import type { TSystem } from './system';

/**
 * An entity is a unique identifier for a game object.
 */
export type TEntity = number;

export class TECS {
  private entities: Map<TEntity, TComponentContainer> = new Map();
  private systems: TSystem[] = [];

  private nextEntityId = 0;

  public createEntity(components?: TComponent[]): TEntity {
    const entity = this.nextEntityId;
    this.nextEntityId++;

    this.entities.set(entity, new TComponentContainer(components));
    return entity;
  }

  public removeEntity(entity: TEntity): void {
    this.entities.delete(entity);
  }

  public addComponent(entity: TEntity, component: TComponent): void {
    this.entities.get(entity)?.add(component);
  }

  public addComponents(entity: TEntity, components: TComponent[]): void {
    for (const component of components) {
      this.addComponent(entity, component);
    }
  }

  public removeComponent(
    entity: TEntity,
    componentClass: TComponentConstructor,
  ): void {
    this.entities.get(entity)?.remove(componentClass);
  }

  public addSystem(system: TSystem): void {
    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
  }

  public removeSystem(system: TSystem): void {
    this.systems.splice(this.systems.indexOf(system), 1);
  }

  public update(engine: TEngine, world: TWorld, delta: number): void {
    for (const system of this.systems) {
      system.update(engine, world, this, delta);
    }
  }

  public getComponent<T extends TComponent>(
    entity: TEntity,
    componentClass: TComponentConstructor<T>,
  ): T | undefined {
    return this.entities.get(entity)?.get(componentClass);
  }

  public getComponents(entity: TEntity): TComponentContainer | undefined {
    return this.entities.get(entity);
  }

  public createQuery(components: TComponentConstructor[]): TECSQuery {
    return new TECSQuery(this, components);
  }

  public queryEntities(
    components: TComponentConstructor[],
    excludedComponents: TComponentConstructor[] = [],
  ): TEntity[] {
    return Array.from(this.entities.keys()).filter((entity) => {
      const entityComponents = this.getComponents(entity);
      if (!entityComponents) return false;

      return (
        entityComponents.hasAll(components) &&
        !entityComponents.hasAny(excludedComponents)
      );
    });
  }
}
