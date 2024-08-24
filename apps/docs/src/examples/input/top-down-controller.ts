import { quat, vec3 } from 'gl-matrix';
import {
  TGameState,
  TEngine,
  TPawn,
  TPerspectiveCamera,
  TFixedAxisCameraController,
  TTopDownController,
  TSpriteComponent,
  TOriginPoint,
  TResourcePack,
} from '@tedengine/ted';
import type {
  ICamera,
  TActorWithOnUpdate,
  TResourcePackConfig,
} from '@tedengine/ted';
import asteroidTexture from '@assets/asteroid.png';

class Sprite extends TPawn implements TActorWithOnUpdate {
  private sprite: TSpriteComponent;

  public static resources: TResourcePackConfig = {
    textures: [asteroidTexture],
  };

  constructor(engine: TEngine, gameState: TGameState, camera: ICamera) {
    super();

    const controller = new TTopDownController(gameState.events, camera);
    controller.possess(this);

    this.sprite = new TSpriteComponent(engine, this, 1, 1, TOriginPoint.Center);
    this.sprite.applyTexture(engine, asteroidTexture);

    this.rootComponent.transform.translation = vec3.fromValues(0, 0, -3);
  }

  async onUpdate(): Promise<void> {
    if (!this.controller) return;

    this.controller.update();

    const { angle } = this.controller as TTopDownController;

    const q = quat.fromEuler(quat.create(), 0, 0, (angle * 180) / Math.PI + 90);

    this.sprite.transform.rotation = q;
  }
}

class TopDownState extends TGameState {
  public beforeWorldCreate() {
    this.world!.config.gravity = vec3.fromValues(0, 0, 0);
    this.world!.config.mode = '2d';
  }

  public async onCreate(engine: TEngine) {
    const rp = new TResourcePack(engine, Sprite.resources);

    await rp.load();

    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const camera = new TPerspectiveCamera(engine);
    this.addActor(camera);

    const box = new Sprite(engine, this, camera);
    this.addActor(box);

    const controller = new TFixedAxisCameraController({
      distance: 5,
      axis: 'z',
    });
    controller.attachTo(box.rootComponent);
    camera.controller = controller;

    this.activeCamera = camera;
  }
}

const config = {
  states: {
    game: TopDownState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
