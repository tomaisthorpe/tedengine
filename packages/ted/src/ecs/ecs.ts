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
  private systems: Set<TSystem> = new Set();

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
    this.systems.add(system);
  }

  public removeSystem(system: TSystem): void {
    this.systems.delete(system);
  }

  public update(engine: TEngine, world: TWorld, delta: number): void {
    for (const system of this.systems.keys()) {
      system.update(engine, world, this, delta);
    }
  }

  public getComponents(entity: TEntity): TComponentContainer | undefined {
    return this.entities.get(entity);
  }

  public createQuery(components: TComponentConstructor[]): TECSQuery {
    return new TECSQuery(this, components);
  }

  public queryEntities(components: TComponentConstructor[]): TEntity[] {
    return Array.from(this.entities.keys()).filter((entity) =>
      this.getComponents(entity)?.hasAll(components),
    );
  }
}
