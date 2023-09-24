import landscapeMtl from '@assets/landscape.mtl';
import landscapeMesh from '@assets/landscape.obj';
import { vec3 } from 'gl-matrix';
import type { TResourcePackConfig } from '@tedengine/ted';
import {
  TGameState,
  TActor,
  TResourcePack,
  TMeshComponent,
  TEngine,
} from '@tedengine/ted';

class Landscape extends TActor {
  public static resources: TResourcePackConfig = {
    meshes: [landscapeMesh],
    materials: [landscapeMtl],
  };

  private paused = false;

  constructor(engine: TEngine) {
    super();

    const mesh = new TMeshComponent(engine, this);
    mesh.applyMesh(engine, landscapeMesh);
    mesh.applyMaterial(engine, landscapeMtl);
    mesh.transform.scale = vec3.fromValues(0.1, 0.1, 0.1);

    this.rootComponent.transform.translation = vec3.fromValues(0, 0, -2);
    this.rootComponent.transform.rotateX(0.3);

    engine.debugPanel.addButtons('Rotation', {
      label: 'Pause',
      onClick: (button) => {
        this.paused = !this.paused;

        if (this.paused) {
          button.label = 'Resume';
        } else {
          button.label = 'Pause';
        }
      },
    });
  }

  protected onUpdate(engine: TEngine, delta: number) {
    if (!this.paused) {
      this.rootComponent.transform.rotateY(delta * 0.5 * 0.7);
    }
  }
}

class MeshState extends TGameState {
  public async onCreate(engine: TEngine) {
    const rp = new TResourcePack(engine, Landscape.resources);

    await rp.load();

    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const landscape = new Landscape(engine);
    this.addActor(landscape);
  }
}

const config = {
  states: {
    game: MeshState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
