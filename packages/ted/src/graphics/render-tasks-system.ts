import TAnimatedSpriteComponent from '../components/animated-sprite-component';
import TMeshComponent, {
  TMaterialComponent,
} from '../components/mesh-component';
import TSpriteComponent, {
  TSpriteInstancesComponent,
} from '../components/sprite-component';
import { TTextureComponent } from '../components/textured-mesh-component';
import TTexturedMeshComponent from '../components/textured-mesh-component';
import type TWorld from '../core/world';
import type TEngine from '../engine/engine';
import type {
  TSerializedRenderTask,
  TSerializedTexturedMaterial,
} from '../renderer/frame-params';
import { TRenderTask } from '../renderer/frame-params';
import {
  TTransformComponent,
  TShouldRenderComponent,
  TMeshReadyComponent,
  TTexturedMeshReadyComponent,
  TParentEntityComponent,
  TSpriteReadyComponent,
} from '../components';
import type { TECS } from '../ecs/ecs';
import type TECSQuery from '../ecs/query';
import { TSystem, TSystemPriority } from '../ecs/system';

export class TMeshRenderSystem extends TSystem {
  public readonly priority: number = TSystemPriority.PostUpdate;
  
  private meshQuery: TECSQuery;
  private texturedMeshQuery: TECSQuery;
  private spriteQuery: TECSQuery;

  public renderTasks: TSerializedRenderTask[] = [];

  public constructor(ecs: TECS) {
    super();

    this.meshQuery = ecs.createQuery([
      TTransformComponent,
      TMeshComponent,
      TMaterialComponent,
      TShouldRenderComponent,
      TMeshReadyComponent,
    ]);

    this.texturedMeshQuery = ecs.createQuery([
      TTransformComponent,
      TTexturedMeshComponent,
      TTextureComponent,
      TShouldRenderComponent,
      TTexturedMeshReadyComponent,
    ]);

    this.spriteQuery = ecs.createQuery([
      TTransformComponent,
      TSpriteComponent,
      TShouldRenderComponent,
      TSpriteReadyComponent,
      TTextureComponent,
    ]);
  }

  public async update(
    engine: TEngine,
    world: TWorld,
    ecs: TECS,
  ): Promise<void> {
    this.renderTasks = [];

    const entities = this.meshQuery.execute();

    for (const entity of entities) {
      const components = ecs.getComponents(entity);

      if (!components) continue;

      const mesh = components.get(TMeshComponent);
      const material = components.get(TMaterialComponent);
      const transform = components.get(TTransformComponent);

      let matrix = transform.transform.getMatrix();

      if (components.has(TParentEntityComponent)) {
        const parent = components.get(TParentEntityComponent);
        const parentTransform = ecs
          .getComponents(parent.entity)!
          .get(TTransformComponent);
        if (parentTransform) {
          matrix = parentTransform.transform
            .add(transform.transform)
            .getMatrix();
        }
      }

      this.renderTasks.push({
        type: TRenderTask.MeshInstance,
        uuid: mesh.uuid!,
        transform: matrix,
        material: material.material.serialize()!,
      });
    }

    const texturedEntities = this.texturedMeshQuery.execute();

    for (const entity of texturedEntities) {
      const components = ecs.getComponents(entity);

      if (!components) continue;

      const mesh = components.get(TTexturedMeshComponent);
      const texture = components.get(TTextureComponent);
      const transform = components.get(TTransformComponent);

      let matrix = transform.transform.getMatrix();

      if (components.has(TParentEntityComponent)) {
        const parent = components.get(TParentEntityComponent);
        const parentTransform = ecs
          .getComponents(parent.entity)!
          .get(TTransformComponent);
        if (parentTransform) {
          matrix = parentTransform.transform
            .add(transform.transform)
            .getMatrix();
        }
      }

      this.renderTasks.push({
        type: TRenderTask.MeshInstance,
        uuid: mesh.uuid!,
        transform: matrix,
        material: {
          type: 'textured',
          options: {
            texture: texture.texture.uuid!,
            colorFilter: texture.colorFilter,
            instanceUVScales: texture.instanceUVScales,
          },
        },
      });
    }

    const spriteEntities = this.spriteQuery.execute();

    for (const entity of spriteEntities) {
      const components = ecs.getComponents(entity);

      if (!components) continue;

      const sprite = components.get(TSpriteComponent);
      const transform = components.get(TTransformComponent);
      const texture = components.get(TTextureComponent);

      if (!sprite || !texture) {
        continue;
      }

      // @todo fix the any
      const materialOptions: any = {
        texture: texture.texture.uuid!,
        colorFilter: sprite.colorFilter,
        instanceUVScales: sprite.instanceUVScales,
      };

      if (components.has(TAnimatedSpriteComponent)) {
        const animatedSprite = components.get(TAnimatedSpriteComponent);

        if (animatedSprite.instanceUVs) {
          materialOptions.instanceUVs = animatedSprite.instanceUVs;
        }
      }

      if (components.has(TSpriteInstancesComponent)) {
        console.log('has sprite instances');
        const spriteInstances = components.get(TSpriteInstancesComponent);

        const instances = spriteInstances.instances.map((instance) => ({
          transform: transform.transform.add(instance.transform).getMatrix(),
          material: {
            type: 'textured',
            options: {
              texture: texture.texture.uuid!,
              colorFilter: instance.colorFilter,
            },
          } as TSerializedTexturedMaterial,
        }));

        this.renderTasks.push({
          type: TRenderTask.SpriteInstances,
          uuid: sprite.uuid!,
          instances: instances,
          material: {
            type: 'textured',
            options: materialOptions,
          },
          layer: sprite.layer,
        });
        continue;
      }

      this.renderTasks.push({
        type: TRenderTask.SpriteInstance,
        uuid: sprite.uuid!,
        transform: transform.transform.getMatrix(),
        material: {
          type: 'textured',
          options: materialOptions,
        },
        layer: sprite.layer,
      });
    }
  }
}
