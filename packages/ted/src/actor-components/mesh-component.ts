import type TActor from '../core/actor';
import type TEngine from '../engine/engine';
import type TColorMaterial from '../graphics/color-material';
import TMesh from '../graphics/mesh';
import type { TSerializedMeshInstance } from '../renderer/frame-params';
import { TRenderTask } from '../renderer/frame-params';
import type { TPaletteIndex } from '../renderer/renderable-mesh';
import TSceneComponent from './scene-component';

export default class TMeshComponent extends TSceneComponent {
  protected mesh: TMesh = new TMesh();
  public material?: TColorMaterial;

  constructor(protected engine: TEngine, actor: TActor) {
    super(actor);

    this.canRender = true;
    this.shouldRender = true;
  }

  public getRenderTask(): TSerializedMeshInstance | undefined {
    // Return undefined if a mesh isn't ready to be rendered
    if (!this.mesh || !this.mesh.uuid || !this.material) {
      return undefined;
    }

    const material = this.material.serialize();
    if (!material) {
      return undefined;
    }

    return {
      type: TRenderTask.MeshInstance,
      uuid: this.mesh.uuid,
      transform: this.getWorldTransform().getMatrix(),
      material,
    };
  }

  /**
   * Clears the current mesh and starts loading the new mesh
   *
   * @param {TEngine} engine
   * @param {string} mesh path
   * @param {TMaterials | string } materials or path
   */
  public async applyMesh(engine: TEngine, path: string) {
    this.mesh = engine.resources.get<TMesh>(path);
  }

  public async applyMaterial(engine: TEngine, path: string) {
    this.material = engine.resources.get<TColorMaterial>(path);
  }

  public async setMesh(
    engine: TEngine,
    positions: number[],
    normals: number[],
    indexes: number[],
    colors: number[],
    paletteIndex: TPaletteIndex
  ) {
    const mesh = new TMesh();

    // Load geometry on GPU
    await mesh.loadMesh(
      engine,
      positions,
      normals,
      indexes,
      colors,
      paletteIndex
    );

    this.mesh = mesh;
  }

  public setMaterial(material: TColorMaterial) {
    this.material = material;
  }
}
