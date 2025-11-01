import { TAnimatedSpriteComponent } from '../components/animated-sprite-component';
import {
  TMeshComponent,
  TMaterialComponent,
} from '../components/mesh-component';
import {
  TSpriteComponent,
  TSpriteInstancesComponent,
} from '../components/sprite-component';
import { TTextureComponent } from '../components/textured-mesh-component';
import { TTexturedMeshComponent } from '../components/textured-mesh-component';
import type { TWorld } from '../core/world';
import type { TEngine } from '../engine/engine';
import type {
  TSerializedRenderTask,
  TSerializedTexturedMaterial,
  TTexturedMaterialOptions,
} from '../renderer/frame-params';
import { TRenderTask } from '../renderer/frame-params';
import {
  TTransformComponent,
  TMeshReadyComponent,
  TTexturedMeshReadyComponent,
  TSpriteReadyComponent,
  TVisibilityState,
  TVisibilityComponent,
} from '../components';
import type { TEntityQuery } from '../core/entity-query';
import { TSystem, TSystemPriority } from '../core/system';
import { TGlobalTransformComponent } from '../components/global-transform';

export class TMeshRenderSystem extends TSystem {
  public static readonly systemName: string = 'TMeshRenderSystem';
  public readonly priority: number = TSystemPriority.PostUpdate;

  private meshQuery: TEntityQuery;
  private texturedMeshQuery: TEntityQuery;
  private spriteQuery: TEntityQuery;

  public renderTasks: TSerializedRenderTask[] = [];

  public constructor(world: TWorld) {
    super();

    this.meshQuery = world.createQuery([
      TGlobalTransformComponent,
      TMeshComponent,
      TMaterialComponent,
      TVisibilityComponent,
      TMeshReadyComponent,
    ]);

    this.texturedMeshQuery = world.createQuery([
      TGlobalTransformComponent,
      TTexturedMeshComponent,
      TTextureComponent,
      TVisibilityComponent,
      TTexturedMeshReadyComponent,
    ]);

    this.spriteQuery = world.createQuery([
      TGlobalTransformComponent,
      TSpriteComponent,
      TVisibilityComponent,
      TSpriteReadyComponent,
      TTextureComponent,
    ]);
  }

  public async update(engine: TEngine, world: TWorld): Promise<void> {
    this.renderTasks = [];

    const entities = this.meshQuery.execute();

    for (const entity of entities) {
      const components = world.getComponents(entity);

      if (!components) continue;

      const visibility = components.get(TVisibilityComponent);

      if (!visibility || visibility.state === TVisibilityState.Hidden) {
        continue;
      }

      const mesh = components.get(TMeshComponent);
      const material = components.get(TMaterialComponent);
      const transform = components.get(TGlobalTransformComponent);

      if (!mesh || !material || !transform || !transform.transform) {
        continue;
      }

      if (!mesh.uuid) {
        continue;
      }

      const serializedMaterial = material.material.serialize();
      if (!serializedMaterial) {
        continue;
      }

      const matrix = transform.transform.getMatrix();

      this.renderTasks.push({
        type: TRenderTask.MeshInstance,
        uuid: mesh.uuid,
        transform: matrix,
        material: serializedMaterial,
      });
    }

    const texturedEntities = this.texturedMeshQuery.execute();

    for (const entity of texturedEntities) {
      const components = world.getComponents(entity);

      if (!components) continue;

      const mesh = components.get(TTexturedMeshComponent);
      const texture = components.get(TTextureComponent);
      const transform = components.get(TGlobalTransformComponent);

      if (!mesh || !texture || !transform || !transform.transform) {
        continue;
      }

      if (!mesh.uuid || !texture.texture.uuid) {
        continue;
      }

      const matrix = transform.transform.getMatrix();

      this.renderTasks.push({
        type: TRenderTask.MeshInstance,
        uuid: mesh.uuid,
        transform: matrix,
        material: {
          type: 'textured',
          options: {
            texture: texture.texture.uuid,
            colorFilter: texture.colorFilter,
            instanceUVScales: texture.instanceUVScales,
          },
        },
      });
    }

    const spriteEntities = this.spriteQuery.execute();

    for (const entity of spriteEntities) {
      const components = world.getComponents(entity);

      if (!components) continue;

      const sprite = components.get(TSpriteComponent);
      const transform = components.get(TTransformComponent);
      const texture = components.get(TTextureComponent);

      if (!sprite || !transform || !texture || !texture.texture.uuid) {
        continue;
      }

      const materialOptions: TTexturedMaterialOptions = {
        texture: texture.texture.uuid,
        colorFilter: sprite.colorFilter,
        instanceUVScales: sprite.instanceUVScales,
      };

      if (components.has(TAnimatedSpriteComponent)) {
        const animatedSprite = components.get(TAnimatedSpriteComponent);

        if (animatedSprite?.instanceUVs) {
          materialOptions.instanceUVs = animatedSprite.instanceUVs;
        }
      }

      if (components.has(TSpriteInstancesComponent)) {
        console.log('has sprite instances');
        const spriteInstances = components.get(TSpriteInstancesComponent);

        if (!spriteInstances || !sprite.uuid) {
          continue;
        }

        const instances = spriteInstances.instances.map((instance) => ({
          transform: transform.transform.add(instance.transform).getMatrix(),
          material: {
            type: 'textured',
            options: {
              texture: texture.texture.uuid,
              colorFilter: instance.colorFilter,
            },
          } as TSerializedTexturedMaterial,
        }));

        this.renderTasks.push({
          type: TRenderTask.SpriteInstances,
          uuid: sprite.uuid,
          instances: instances,
          material: {
            type: 'textured',
            options: materialOptions,
          },
          layer: sprite.layer,
        });
        continue;
      }

      if (!sprite.uuid) {
        continue;
      }

      this.renderTasks.push({
        type: TRenderTask.SpriteInstance,
        uuid: sprite.uuid,
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
