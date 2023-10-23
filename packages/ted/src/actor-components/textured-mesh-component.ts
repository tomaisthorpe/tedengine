import type TActor from '../core/actor';
import type TEngine from '../engine/engine';
import TTexture from '../graphics/texture';
import TTexturedMesh from '../graphics/textured-mesh';
import type { TPhysicsBodyOptions } from '../physics/physics-world';
import type {
  TSerializedMeshInstance,
  TSerializedSpriteInstance,
} from '../renderer/frame-params';
import { TRenderTask } from '../renderer/frame-params';
import TSceneComponent from './scene-component';

export default class TTexturedMeshComponent extends TSceneComponent {
  protected mesh: TTexturedMesh = new TTexturedMesh();
  public texture: TTexture = new TTexture();

  constructor(actor: TActor, bodyOptions?: TPhysicsBodyOptions) {
    super(actor, bodyOptions);

    this.canRender = true;
    this.shouldRender = true;
  }

  // @todo look at how to remove this sprite type
  public getRenderTask():
    | TSerializedMeshInstance
    | TSerializedSpriteInstance
    | undefined {
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
          texture: this.texture.uuid,
        },
      },
    };
  }

  public async setMesh(
    engine: TEngine,
    positions: number[],
    normals: number[],
    indexes: number[],
    uvs: number[]
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
    this.texture = engine.resources.get<TTexture>(texturePath as string);
  }

  public setTexture(texture: TTexture) {
    this.texture = texture;
  }
}
