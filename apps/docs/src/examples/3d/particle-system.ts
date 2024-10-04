import asteroidTexture from '@assets/asteroid.png';
import { quat, vec3, vec4 } from 'gl-matrix';
import type { TResourcePackConfig } from '@tedengine/ted';
import {
  TGameState,
  TActor,
  TResourcePack,
  TEngine,
  TParticlesComponent,
} from '@tedengine/ted';

class Sprite extends TActor {
  public static resources: TResourcePackConfig = {
    textures: [asteroidTexture],
  };

  constructor(engine: TEngine) {
    super();

    const box = new TParticlesComponent(engine, this, 0.2, 0.2, {
      emitter: {
        maxParticles: 100,
        maxEmitRate: 40,
        minEmitRate: 20,
      },
      initializers: {
        ttl: 1,
        position: () => {
          // Add slight offset to randomize particle spawn
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 0.025 + 0.025;

          return vec3.fromValues(
            Math.cos(angle) * distance,
            Math.sin(angle) * distance,
            0,
          );
        },
        scale: () => {
          const randomScale = Math.random() * 0.2 + 0.1;
          return vec3.fromValues(randomScale, randomScale, randomScale);
        },
        velocity: () => {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 0.01 + 0.01;

          return vec3.fromValues(
            Math.cos(angle) * speed * 0.25,
            Math.abs(Math.sin(angle) * speed),
            0,
          );
        },
        rotation: () => {
          const randomRotation = Math.random() * Math.PI * 2;
          const randomRotationInDegrees = randomRotation * (180 / Math.PI);
          return quat.fromEuler(quat.create(), 0, 0, randomRotationInDegrees);
        },
      },
      behaviours: {
        force: () => {
          return vec3.fromValues(0, -0.02, 0);
        },
      },
    });
    box.applyTexture(engine, asteroidTexture);

    this.rootComponent.transform.translation = vec3.fromValues(0, 0, -3);
  }
}

class SpriteState extends TGameState {
  public async onCreate(engine: TEngine) {
    const rp = new TResourcePack(engine, Sprite.resources);

    await rp.load();

    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const asteroid = new Sprite(engine);
    this.addActor(asteroid);
  }
}

const config = {
  states: {
    game: SpriteState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
