import { vec2, vec3, vec4 } from 'gl-matrix';
import TTransform from '../math/transform';
import type { TTexturedMeshGeometry } from './textured-mesh-component';
import { TComponent } from '../ecs/component';

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

export default class TSpriteComponent extends TComponent {
  public width: number;
  public height: number;
  public origin: TOriginPoint;
  public layer: TSpriteLayer;
  public colorFilter?: vec4;
  public instanceUVScales?: vec2;

  public geometry: TTexturedMeshGeometry;

  public uuid?: string;

  constructor(options: {
    width: number;
    height: number;
    origin?: TOriginPoint;
    layer?: TSpriteLayer;
    colorFilter?: vec4;
    instanceUVScales?: vec2;
  }) {
    super();

    this.width = options.width;
    this.height = options.height;
    this.origin = options.origin ?? TOriginPoint.Center;
    this.layer = options.layer ?? TSpriteLayer.Foreground_0;
    this.colorFilter = options.colorFilter ?? vec4.fromValues(1, 1, 1, 1);
    this.instanceUVScales = options.instanceUVScales ?? vec2.fromValues(1, 1);

    this.geometry = this.generateGeometry();
  }

  private generateGeometry(): TTexturedMeshGeometry {
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

    return {
      positions,
      normals,
      indexes: index,
      uvs: faceUVs,
    };
  }
}

export class TSpriteInstancesComponent extends TComponent {
  public instances: {
    transform: TTransform;
    colorFilter?: vec4;
  }[];

  constructor(
    instances: {
      transform: TTransform;
      colorFilter?: vec4;
    }[],
  ) {
    super();

    this.instances = instances;
  }
}
