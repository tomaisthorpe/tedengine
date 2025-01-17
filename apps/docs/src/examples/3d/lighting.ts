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
  TOrbitCamera,
} from '@tedengine/ted';

class Landscape extends TActor {
  public static resources: TResourcePackConfig = {
    meshes: [landscapeMesh],
    materials: [landscapeMtl],
  };

  constructor(engine: TEngine) {
    super();

    const mesh = new TMeshComponent(engine, this);
    mesh.applyMesh(engine, landscapeMesh);
    mesh.applyMaterial(engine, landscapeMtl);
    mesh.transform.scale = vec3.fromValues(0.1, 0.1, 0.1);
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

    const orbitCamera = new TOrbitCamera(engine, 2.5);
    orbitCamera.speed = 0;
    this.addActor(orbitCamera);

    this.activeCamera = orbitCamera;

    this.world.config.lighting = {
      ambientLightIntensity: 0.1,
      directionalLight: vec3.fromValues(-0.5, 0.7, 0.2),
    };

    const section = engine.debugPanel.addSection('Lighting', true);
    section.addInput(
      'Ambient Light',
      'range',
      this.world.config.lighting.ambientLightIntensity.toString(),
      (value) => {
        this.world.config.lighting.ambientLightIntensity = parseFloat(value);
      },
      {
        min: 0,
        max: 1,
        step: 0.1,
        showValueBubble: true,
      },
    );

    section.addInput(
      'Directional Light [x]',
      'range',
      this.world.config.lighting.directionalLight[0].toString(),
      (value) => {
        this.world.config.lighting.directionalLight[0] = parseFloat(value);
      },
      {
        min: -1,
        max: 1,
        step: 0.1,
        showValueBubble: true,
      },
    );

    section.addInput(
      'Directional Light [y]',
      'range',
      this.world.config.lighting.directionalLight[1].toString(),
      (value) => {
        this.world.config.lighting.directionalLight[1] = parseFloat(value);
      },
      {
        min: -1,
        max: 1,
        step: 0.1,
        showValueBubble: true,
      },
    );

    section.addInput(
      'Directional Light [z]',
      'range',
      this.world.config.lighting.directionalLight[2].toString(),
      (value) => {
        this.world.config.lighting.directionalLight[2] = parseFloat(value);
      },
      {
        min: -1,
        max: 1,
        step: 0.1,
        showValueBubble: true,
      },
    );
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
