import type { vec4 } from 'gl-matrix';
import type TActor from '../core/actor';
import type TEngine from '../engine/engine';
import TTexture from '../graphics/texture';
import TTexturedMesh from '../graphics/textured-mesh';
import type { TPhysicsBodyOptions } from '../physics/physics-world';
import type {
  TSerializedMeshInstance,
  TSerializedRenderTask,
} from '../renderer/frame-params';
import { TRenderTask } from '../renderer/frame-params';
import TSceneComponent from './scene-component';

export default class TTexturedMeshComponent extends TSceneComponent {
  protected mesh: TTexturedMesh = new TTexturedMesh();
  public texture: TTexture = new TTexture();

  public colorFilter?: vec4;

  public instanceUVScales?: [number, number];

  constructor(actor: TActor, bodyOptions?: TPhysicsBodyOptions) {
    super(actor, bodyOptions);

    this.canRender = true;
    this.shouldRender = true;
  }

  // @todo look at how to remove this sprite type
  public getRenderTask(): TSerializedRenderTask | undefined {
    if (!this.mesh || !this.mesh.uuid || !this.texture) {
      return undefined;
    }

    return {
      type: TRenderTask.MeshInstance,
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
    } as TSerializedMeshInstance;
  }

  public async setMesh(
    engine: TEngine,
    positions: number[],
    normals: number[],
    indexes: number[],
    uvs: number[],
  ) {
    const mesh = new TTexturedMesh();

    // Load geometry on GPU
    await mesh.loadMesh(engine, positions, normals, indexes, uvs);

    this.mesh = mesh;
  }

  /**
   * Assigns a given texture to this component.
   *
   * @param {TEngine} engine
   * @param {string} texture path
   */
  public async applyTexture(engine: TEngine, texturePath: string | TTexture) {
    const texture = engine.resources.get<TTexture>(texturePath as string);

    // @todo handle error if texture is not found
    if (texture) {
      this.texture = texture;
    }
  }

  public setTexture(texture: TTexture) {
    this.texture = texture;
  }
}
