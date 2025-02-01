import { vec3 } from 'gl-matrix';
import type TActor from '../core/actor';
import type TEngine from '../engine/engine';
import TTransform from '../math/transform';
import type {
  TSerializedRenderTask,
  TSerializedSpriteInstance,
} from '../renderer/frame-params';
import { TRenderTask } from '../renderer/frame-params';
import TTexturedMeshComponent from './textured-mesh-component';
import type { TPhysicsBodyOptions } from '../physics/physics-world';

export enum TOriginPoint {
  TopLeft,
  TopCenter,
  TopRight,
  LeftCenter,
  Center,
  RightCenter,
  BottomLeft,
  BottomCenter,
  BottomRight,
}

/**
 * Sprite layer defines the order of when sprites should be rendered
 */
export enum TSpriteLayer {
  Background_0,
  Background_1,
  Background_2,
  Background_3,
  Background_4,
  Midground_0,
  Midground_1,
  Midground_2,
  Midground_3,
  Midground_4,
  Foreground_0,
  Foreground_1,
  Foreground_2,
  Foreground_3,
  Foreground_4,
}

export default class TSpriteComponent extends TTexturedMeshComponent {
  constructor(
    private engine: TEngine,
    actor: TActor,
    public width: number,
    public height: number,
    private origin: TOriginPoint = TOriginPoint.Center,
    public layer: TSpriteLayer = TSpriteLayer.Foreground_0,
    bodyOptions?: TPhysicsBodyOptions,
  ) {
    super(actor, bodyOptions);

    this.width = width;
    this.height = height;

    this.canRender = true;
    this.shouldRender = true;

    this.generateMesh();
  }

  public getRenderTask(): TSerializedRenderTask | undefined {
    if (!this.mesh || !this.mesh.uuid || !this.texture) {
      return undefined;
    }

    return {
      type: TRenderTask.SpriteInstance,
      uuid: this.mesh.uuid,
      transform: this.getWorldTransform().getMatrix(),
      material: {
        type: 'textured',
        options: {
          texture: this.texture.uuid!,
          colorFilter: this.colorFilter,
          instanceUVScales: this.instanceUVScales,
        },
      },
      layer: this.layer,
    } as TSerializedSpriteInstance;
  }

  public setOrigin(origin: TOriginPoint) {
    this.origin = origin;
    this.generateMesh();
  }

  protected generateMesh() {
    const x = this.width / 2.0;
    const y = this.height / 2.0;

    const vertices = [
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(0, -this.height, 0),
      vec3.fromValues(this.width, 0, 0),
      vec3.fromValues(this.width, -this.height, 0),
    ];

    const transform: TTransform = new TTransform();

    switch (this.origin) {
      case TOriginPoint.TopCenter: {
        transform.translation[0] = -x;
        transform.translation[1] = 0;
        break;
      }
      case TOriginPoint.TopRight: {
        transform.translation[0] = -this.width;
        transform.translation[1] = 0;
        break;
      }
      case TOriginPoint.LeftCenter: {
        transform.translation[0] = 0;
        transform.translation[1] = y;
        break;
      }
      case TOriginPoint.Center: {
        transform.translation[0] = -x;
        transform.translation[1] = y;
        break;
      }
      case TOriginPoint.RightCenter: {
        transform.translation[0] = -this.width;
        transform.translation[1] = y;
        break;
      }
      case TOriginPoint.BottomLeft: {
        transform.translation[0] = 0;
        transform.translation[1] = this.height;
        break;
      }
      case TOriginPoint.BottomCenter: {
        transform.translation[0] = -x;
        transform.translation[1] = this.height;
        break;
      }
      case TOriginPoint.BottomRight: {
        transform.translation[0] = -this.width;
        transform.translation[1] = this.height;
        break;
      }
    }

    const mat = transform.getMatrix();

    const positions = [];

    for (const vertex of vertices) {
      const result = vec3.transformMat4(vec3.create(), vertex, mat);
      positions.push(result[0], result[1], result[2]);
    }

    const normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];

    const index = [0, 1, 2, 1, 3, 2];

    const faceUVs = [0, 1, 0, 0, 1, 1, 1, 0];

    this.setMesh(this.engine, positions, normals, index, faceUVs);
  }
}
