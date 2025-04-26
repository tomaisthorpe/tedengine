import TMeshComponent from '../components/mesh-component';
import TTexturedMeshComponent from '../components/textured-mesh-component';
import type TWorld from '../core/world';
import type TEngine from '../engine/engine';
import TMesh from './mesh';
import TTexturedMesh from './textured-mesh';
import {
  TMeshReadyComponent,
  TSpriteReadyComponent,
  TTexturedMeshReadyComponent,
} from '../components';
import type { TEntityQuery } from '../core/entity-query';
import { TSystem, TSystemPriority } from '../core/system';
import TSpriteComponent from '../components/sprite-component';

export class TMeshLoadSystem extends TSystem {
  public readonly priority: number = TSystemPriority.PreUpdate;

  private query: TEntityQuery;
  public constructor(world: TWorld) {
    super();

    this.query = world.createQuery([TMeshComponent]);
  }

  public async update(engine: TEngine, world: TWorld): Promise<void> {
    const entities = this.query.execute();
    for (const entity of entities) {
      const components = world.getComponents(entity);

      if (!components || components?.has(TMeshReadyComponent)) {
        continue;
      }
      const mesh = components?.get(TMeshComponent);

      // Mesh has already been loaded
      if (mesh.uuid) {
        world.addComponent(entity, new TMeshReadyComponent());
        continue;
      }

      const { data } = mesh;

      if (data.source === 'inline') {
        const m = new TMesh();
        await m.loadMesh(
          engine,
          data.geometry.positions,
          data.geometry.normals,
          data.geometry.indexes,
          data.geometry.colors,
          data.geometry.paletteIndex,
        );

        mesh.uuid = m.uuid;

        world.addComponent(entity, new TMeshReadyComponent());
      } else if (data.source === 'path') {
        const m = await engine.resources.get<TMesh>(data.path);
        mesh.uuid = m!.uuid;
        world.addComponent(entity, new TMeshReadyComponent());
      }
    }
  }
}

export class TTexturedMeshLoadSystem extends TSystem {
  public readonly priority: number = TSystemPriority.PreUpdate;

  private query: TEntityQuery;
  public constructor(world: TWorld) {
    super();

    this.query = world.createQuery([TTexturedMeshComponent]);
  }

  public async update(engine: TEngine, world: TWorld): Promise<void> {
    const entities = this.query.execute();
    for (const entity of entities) {
      const components = world.getComponents(entity);

      if (!components || components?.has(TTexturedMeshReadyComponent)) {
        continue;
      }

      const mesh = components?.get(TTexturedMeshComponent);

      const { data } = mesh;

      if (data.source === 'inline') {
        const m = new TTexturedMesh();
        await m.loadMesh(
          engine,
          data.geometry.positions,
          data.geometry.normals,
          data.geometry.indexes,
          data.geometry.uvs,
        );

        mesh.uuid = m.uuid;

        world.addComponent(entity, new TTexturedMeshReadyComponent());
      } else if (data.source === 'path') {
        const m = await engine.resources.get<TTexturedMesh>(data.path);
        mesh.uuid = m!.uuid;
        world.addComponent(entity, new TTexturedMeshReadyComponent());
      }
    }
  }
}

export class TSpriteLoadSystem extends TSystem {
  public readonly priority: number = TSystemPriority.PreUpdate;

  private query: TEntityQuery;
  public constructor(world: TWorld) {
    super();

    this.query = world.createQuery([TSpriteComponent]);
  }

  public async update(engine: TEngine, world: TWorld): Promise<void> {
    const entities = this.query.execute();
    for (const entity of entities) {
      const components = world.getComponents(entity);

      if (!components || components?.has(TSpriteReadyComponent)) {
        continue;
      }

      const sprite = components?.get(TSpriteComponent);

      const { geometry } = sprite;

      const m = new TTexturedMesh();
      await m.loadMesh(
        engine,
        geometry.positions,
        geometry.normals,
        geometry.indexes,
        geometry.uvs,
      );

      sprite.uuid = m.uuid;

      world.addComponent(entity, new TSpriteReadyComponent());
    }
  }
}
