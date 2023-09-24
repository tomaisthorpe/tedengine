import shipMtl from '@assets/ship.mtl';
import shipMesh from '@assets/ship.obj';
import { vec3 } from 'gl-matrix';
import type { TResourcePackConfig } from '@tedengine/ted';
import {
  TGameState,
  TActor,
  TResourcePack,
  TMeshComponent,
  TOrbitCamera,
  TPerspectiveCamera,
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
  }
}

class OrbitState extends TGameState {
  public async onCreate(engine: TEngine) {
    const rp = new TResourcePack(engine, ship.resources);

    await rp.load();
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const aub = new ship(engine);
    this.addActor(aub);

    const debugCamera = new TPerspectiveCamera();
    this.addActor(debugCamera);
    debugCamera.rootComponent.transform.translation = vec3.fromValues(0, 0, 40);

    this.activeCamera = debugCamera;

    const orbitCamera = new TOrbitCamera(engine, 15);
    orbitCamera.cameraComponent.showDebug = true;
    this.addActor(orbitCamera);

    orbitCamera.cameraComponent.showDebugCamera(engine);

    this.activeCamera = orbitCamera;

    const section = engine.debugPanel.addSection('Orbit Camera', true);

    section.addSelect(
      'Camera',
      [
        { label: 'Orbit', value: 'orbit' },
        { label: 'Debug', value: 'debug' },
      ],
      'orbit',
      (camera) => {
        if (camera === 'orbit') {
          this.activeCamera = orbitCamera;
        } else {
          this.activeCamera = debugCamera;
        }
      }
    );

    section.addInput(
      'Orbit Speed',
      'range',
      '1',
      (value) => {
        orbitCamera.speed = parseFloat(value);
      },
      {
        min: -10,
        max: 10,
        step: 0.1,
        showValueBubble: true,
      }
    );

    section.addCheckbox('Mouse Controls', true, (value: boolean) => {
      orbitCamera.enableDrag = value;
    });
  }
}

const config = {
  states: {
    game: OrbitState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
