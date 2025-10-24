import type { TEntityQuery } from '../core/entity-query';
import { TSystem, TSystemPriority } from '../core/system';
import type { TCameraView } from './camera-view';
import { TCameraComponent, TActiveCameraComponent } from './camera-component';
import type { TEngine } from '../engine/engine';
import type { vec2 } from 'gl-matrix';
import { mat4, vec3 } from 'gl-matrix';
import type { TWorld } from '../core/world';
import type { TEntity } from '../core/world';
import { TTransformComponent } from '../components';
import { TTransform } from '../math/transform';
import { TProjectionType } from '../graphics';

export interface TCamera {
  transform: TTransform;
  component: TCameraComponent;
}

export class TCameraSystem extends TSystem {
  public static readonly systemName: string = 'TCameraSystem';
  public readonly priority: number = TSystemPriority.Update;

  private query: TEntityQuery;
  private activeCamera?: TCamera;

  private defaultCamera: TCamera = {
    transform: new TTransform(),
    component: new TCameraComponent({
      type: TProjectionType.Perspective,
      fov: 45,
      zNear: 0.1,
      zFar: 100,
    }),
  };

  public constructor(
    private world: TWorld,
    private engine: TEngine,
  ) {
    super();

    this.query = world.createQuery([TCameraComponent, TActiveCameraComponent]);
  }

  public async update(engine: TEngine, world: TWorld): Promise<void> {
    const entities = this.query.execute();

    if (entities.length === 0) {
      this.activeCamera = undefined;
      return;
    }

    const camera = world.getComponents(entities[0])?.get(TCameraComponent);
    if (!camera) {
      return;
    }

    const transform = world
      .getComponents(entities[0])
      ?.get(TTransformComponent);
    if (!transform) {
      return;
    }

    this.activeCamera = {
      transform: transform.transform,
      component: camera,
    };
  }

  public getView(): TCameraView {
    const camera = this.activeCamera || this.defaultCamera;

    return {
      projectionType: camera.component.cameraConfig.type,
      fov:
        camera.component.cameraConfig.type === TProjectionType.Perspective
          ? camera.component.cameraConfig.fov
          : undefined,
      transform: camera.transform.getMatrix(),
    };
  }

  public getProjectionMatrix(width: number, height: number): mat4 {
    const camera = this.activeCamera || this.defaultCamera;

    if (camera.component.cameraConfig.type === TProjectionType.Perspective) {
      const projection = mat4.create();
      mat4.perspective(
        projection,
        ((camera.component.cameraConfig.fov || 45) * Math.PI) / 180,
        width / height,
        camera.component.cameraConfig.zNear || 0.1,
        camera.component.cameraConfig.zFar || 100,
      );

      const cameraSpace =
        mat4.invert(mat4.create(), camera.transform.getMatrix()) ||
        mat4.identity(mat4.create());

      return mat4.multiply(mat4.create(), projection, cameraSpace);
    }

    const projection = mat4.create();
    mat4.ortho(
      projection,
      -width / 2,
      width / 2,
      -height / 2,
      height / 2,
      camera.component.cameraConfig.zNear || 0.1,
      camera.component.cameraConfig.zFar || 100,
    );

    const cameraSpace =
      mat4.invert(mat4.create(), camera.transform.getMatrix()) ||
      mat4.identity(mat4.create());

    return mat4.multiply(mat4.create(), projection, cameraSpace);
  }

  public setActiveCamera(entity: TEntity) {
    // Get all currently active cameras so we can disable them
    const entities = this.query.execute();
    for (const entity of entities) {
      this.world.removeComponent(entity, TActiveCameraComponent);
    }

    this.world.addComponent(entity, new TActiveCameraComponent());
  }

  public getActiveCamera(): TCamera | undefined {
    return this.activeCamera || this.defaultCamera;
  }

  public clipToWorldSpace(location: vec2): vec3 {
    const projectionMatrix = this.getProjectionMatrix(
      this.engine.renderingSize.width,
      this.engine.renderingSize.height,
    );

    return clipToWorldSpace(projectionMatrix, location);
  }
}

export function clipToWorldSpace(projectionMatrix: mat4, location: vec2): vec3 {
  const invertProj =
    mat4.invert(mat4.create(), projectionMatrix) ||
    mat4.identity(mat4.create());

  const worldspace = vec3.transformMat4(
    vec3.create(),
    vec3.fromValues(location[0], location[1], 0),
    invertProj,
  );

  return worldspace;
}
