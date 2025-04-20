import type TECSQuery from '../ecs/query';
import { TSystem, TSystemPriority } from '../ecs/system';
import type { TCameraView } from './camera-view';
import { TCameraComponent, TActiveCameraComponent } from './camera-component';
import type TEngine from '../engine/engine';
import type { vec2 } from 'gl-matrix';
import { mat4, vec3 } from 'gl-matrix';
import type TWorld from '../core/world';
import type { TECS, TEntity } from '../ecs/ecs';
import { TTransformComponent } from '../components';
import TTransform from '../math/transform';
import { TProjectionType } from '../graphics';

export interface TCamera {
  transform: TTransform;
  component: TCameraComponent;
}

export default class TCameraSystem extends TSystem {
  public readonly priority: number = TSystemPriority.Update;

  private query: TECSQuery;
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
    private ecs: TECS,
    private engine: TEngine,
  ) {
    super();

    this.query = ecs.createQuery([TCameraComponent, TActiveCameraComponent]);
  }

  public async update(
    engine: TEngine,
    world: TWorld,
    ecs: TECS,
  ): Promise<void> {
    const entities = this.query.execute();

    if (entities.length === 0) {
      this.activeCamera = undefined;
      return;
    }

    const camera = ecs.getComponents(entities[0])?.get(TCameraComponent);
    if (!camera) {
      return;
    }

    const transform = ecs.getComponents(entities[0])?.get(TTransformComponent);
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

      const cameraSpace = mat4.invert(
        mat4.create(),
        camera.transform.getMatrix(),
      );

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

    const cameraSpace = mat4.invert(
      mat4.create(),
      camera.transform.getMatrix(),
    );

    return mat4.multiply(mat4.create(), projection, cameraSpace);
  }

  public setActiveCamera(entity: TEntity) {
    // Get all currently active cameras so we can disable them
    const entities = this.query.execute();
    for (const entity of entities) {
      this.ecs.removeComponent(entity, TActiveCameraComponent);
    }

    this.ecs.addComponent(entity, new TActiveCameraComponent());
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
  const invertProj = mat4.invert(mat4.create(), projectionMatrix);

  const worldspace = vec3.transformMat4(
    vec3.create(),
    vec3.fromValues(location[0], location[1], 0),
    invertProj,
  );

  return worldspace;
}
