import TMeshComponent from '../actor-components/mesh-component';
import debugCameraMtl from '../assets/debug-camera.mtl';
import debugCameraMesh from '../assets/debug-camera.obj';
import type TActor from '../core/actor';
import type { TResourcePackConfig } from '../core/resource-pack';
import TResourcePack from '../core/resource-pack';
import type TEngine from '../engine/engine';

export default class TDebugCamera extends TMeshComponent {
  public static resources: TResourcePackConfig = {
    meshes: [debugCameraMesh],
    materials: [debugCameraMtl],
  };

  constructor(engine: TEngine, actor: TActor) {
    super(engine, actor);

    const rp = new TResourcePack(engine, TDebugCamera.resources);
    rp.load().then(() => {
      this.applyMesh(engine, debugCameraMesh);
      this.applyMaterial(engine, debugCameraMtl);
    });
  }
}
