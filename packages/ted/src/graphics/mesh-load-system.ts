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
import type { TECS } from '../ecs/ecs';
import type TECSQuery from '../ecs/query';
import { TSystem, TSystemPriority } from '../ecs/system';
import TSpriteComponent from '../components/sprite-component';

export class TMeshLoadSystem extends TSystem {
  public readonly priority: number = TSystemPriority.PreUpdate;

  private query: TECSQuery;
  public constructor(ecs: TECS) {
    super();

    this.query = ecs.createQuery([TMeshComponent]);
  }

  public async update(engine: TEngine, _: TWorld, ecs: TECS): Promise<void> {
    const entities = this.query.execute();
    for (const entity of entities) {
      const components = ecs.getComponents(entity);

      if (!components || components?.has(TMeshReadyComponent)) {
        continue;
      }
      const mesh = components?.get(TMeshComponent);

      // Mesh has already been loaded
      if (mesh.uuid) {
        ecs.addComponent(entity, new TMeshReadyComponent());
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

        ecs.addComponent(entity, new TMeshReadyComponent());
      } else if (data.source === 'path') {
        const m = await engine.resources.get<TMesh>(data.path);
        mesh.uuid = m!.uuid;
        ecs.addComponent(entity, new TMeshReadyComponent());
      }
    }
  }
}

export class TTexturedMeshLoadSystem extends TSystem {
  public readonly priority: number = TSystemPriority.PreUpdate;

  private query: TECSQuery;
  public constructor(ecs: TECS) {
    super();

    this.query = ecs.createQuery([TTexturedMeshComponent]);
  }

  public async update(engine: TEngine, _: TWorld, ecs: TECS): Promise<void> {
    const entities = this.query.execute();
    for (const entity of entities) {
      const components = ecs.getComponents(entity);

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

        ecs.addComponent(entity, new TTexturedMeshReadyComponent());
      } else if (data.source === 'path') {
        const m = await engine.resources.get<TTexturedMesh>(data.path);
        mesh.uuid = m!.uuid;
        ecs.addComponent(entity, new TTexturedMeshReadyComponent());
      }
    }
  }
}

export class TSpriteLoadSystem extends TSystem {
  public readonly priority: number = TSystemPriority.PreUpdate;

  private query: TECSQuery;
  public constructor(ecs: TECS) {
    super();

    this.query = ecs.createQuery([TSpriteComponent]);
  }

  public async update(engine: TEngine, _: TWorld, ecs: TECS): Promise<void> {
    const entities = this.query.execute();
    for (const entity of entities) {
      const components = ecs.getComponents(entity);

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

      ecs.addComponent(entity, new TSpriteReadyComponent());
    }
  }
}
