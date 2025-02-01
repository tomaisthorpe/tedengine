import trainLocoMesh from '@assets/train-electric-city-a.obj';
import trainPantoMesh from '@assets/train-electric-city-b.obj';
import trainMiddleMesh from '@assets/train-electric-city-c.obj';
import trainTexture from '@assets/kenney-colormap.png';
import { vec3 } from 'gl-matrix';
import type { TResourcePackConfig } from '@tedengine/ted';
import {
  TGameState,
  TActor,
  TResourcePack,
  TTexturedMeshComponent,
  TEngine,
  TSceneComponent,
} from '@tedengine/ted';

class Train extends TActor {
  public static resources: TResourcePackConfig = {
    texturedMeshes: [trainLocoMesh, trainPantoMesh, trainMiddleMesh],
    materials: [],
    textures: [trainTexture],
  };

  private paused = false;

  constructor(engine: TEngine) {
    super();

    const wholeTrain = new TSceneComponent(this);
    wholeTrain.transform.translation = vec3.fromValues(0, 0, 0.365);

    const start = new TTexturedMeshComponent(this);
    start.applyMesh(engine, trainLocoMesh);
    start.applyTexture(engine, trainTexture);
    start.transform.scale = vec3.fromValues(0.1, 0.1, 0.1);
    start.attachTo(wholeTrain);

    const panto = new TTexturedMeshComponent(this);
    panto.applyMesh(engine, trainPantoMesh);
    panto.applyTexture(engine, trainTexture);
    panto.transform.scale = vec3.fromValues(0.1, 0.1, 0.1);
    panto.transform.translation = vec3.fromValues(0, 0, -0.24);
    panto.attachTo(wholeTrain);

    const middle = new TTexturedMeshComponent(this);
    middle.applyMesh(engine, trainMiddleMesh);
    middle.applyTexture(engine, trainTexture);
    middle.transform.scale = vec3.fromValues(0.1, 0.1, 0.1);
    middle.transform.translation = vec3.fromValues(0, 0, -0.495);
    middle.attachTo(wholeTrain);

    const end = new TTexturedMeshComponent(this);
    end.applyMesh(engine, trainLocoMesh);
    end.applyTexture(engine, trainTexture);
    end.transform.scale = vec3.fromValues(0.1, 0.1, 0.1);
    end.transform.translation = vec3.fromValues(0, 0, -0.735);
    end.transform.rotateY(Math.PI);
    end.attachTo(wholeTrain);

    this.rootComponent.transform.translation = vec3.fromValues(0, 0, -1);

    this.rootComponent.transform.rotateX(0.3);
    this.rootComponent.transform.rotateY(Math.PI / 2);

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

class TrainState extends TGameState {
  public async onCreate(engine: TEngine) {
    const rp = new TResourcePack(engine, Train.resources);

    await rp.load();

    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const train = new Train(engine);
    this.addActor(train);

    this.world.config.lighting = {
      ambientLight: {
        intensity: 0.1,
      },
      directionalLight: {
        direction: vec3.fromValues(-0.5, 0.7, 0.2),
        intensity: 1,
      },
    };
  }
}

const config = {
  states: {
    game: TrainState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
