import shipMtl from '@assets/ship.mtl';
import shipMesh from '@assets/ship.obj';
import { vec3 } from 'gl-matrix';
import type { TResourcePackConfig } from '@tedengine/ted';
import {
  TGameState,
  TActor,
  TResourcePack,
  TMeshComponent,
  TPerspectiveCamera,
  TOrthographicCamera,
  TEngine,
} from '@tedengine/ted';

class ship extends TActor {
  public static resources: TResourcePackConfig = {
    meshes: [shipMesh],
    materials: [shipMtl],
  };

  private paused = false;

  constructor(engine: TEngine) {
    super();

    const mesh = new TMeshComponent(engine, this);
    mesh.applyMesh(engine, shipMesh);
    mesh.applyMaterial(engine, shipMtl);
    mesh.transform.scale = vec3.fromValues(1, 1, 1);

    this.rootComponent.transform.translation = vec3.fromValues(0, 0, -15);
    this.rootComponent.transform.rotateZ(0.7);

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

class AubState extends TGameState {
  public async onCreate(engine: TEngine) {
    const rp = new TResourcePack(engine, ship.resources);

    await rp.load();
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const aub = new ship(engine);
    this.addActor(aub);

    const orthoCamera = new TOrthographicCamera();
    this.addActor(orthoCamera);

    const perspectiveCamera = new TPerspectiveCamera();
    this.addActor(perspectiveCamera);

    this.activeCamera = perspectiveCamera;

    // const section = engine.debugPanel.addSection('Camera', true);

    // section.addSelect(
    //   'Projection Mode',
    //   [
    //     { label: 'Perspective', value: 'perspective' },
    //     { label: 'Orthographic', value: 'ortho' },
    //   ],
    //   'perspective',
    //   (mode) => {
    //     if (mode === 'perspective') {
    //       this.activeCamera = perspectiveCamera;
    //     } else {
    //       this.activeCamera = orthoCamera;
    //     }
    //   }
    // );

    // section.addInput(
    //   'FOV',
    //   'range',
    //   '45',
    //   (value: string) => {
    //     perspectiveCamera.fov = parseFloat(value);
    //   },
    //   {
    //     max: 120,
    //     min: 20,
    //     step: 5,
    //     showValueBubble: true,
    //   }
    // );
  }
}

const config = {
  states: {
    game: AubState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

new TEngine(config, postMessage.bind(self));
