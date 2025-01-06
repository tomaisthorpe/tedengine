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

class ManyColors extends TActor {
  public static resources: TResourcePackConfig = {
    textures: [asteroidTexture],
  };

  public particles: TParticlesComponent;

  constructor(engine: TEngine) {
    super();

    this.particles = new TParticlesComponent(engine, this, 0.2, 0.2, {
      emitter: {
        maxParticles: 1000,
        maxEmitRate: 200,
        minEmitRate: 50,
      },
      initializers: {
        ttl: 1,
        position: () => {
          // Add slight offset to randomize particle spawn
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 0.05 + 0.025;

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
          const speed = Math.random() * 0.02 + 0.02;

          return vec3.fromValues(
            Math.cos(angle) * speed * 0.4,
            Math.abs(Math.sin(angle) * speed) * 0.7,
            0,
          );
        },
        rotation: () => {
          const randomRotation = Math.random() * Math.PI * 2;
          const randomRotationInDegrees = randomRotation * (180 / Math.PI);
          return quat.fromEuler(quat.create(), 0, 0, randomRotationInDegrees);
        },
        colorFilter: () => {
          return vec4.fromValues(
            Math.random(),
            Math.random(),
            Math.random(),
            1,
          );
        },
      },
      behaviours: {
        force: () => {
          return vec3.fromValues(0, -0.02, 0);
        },
        scale: ({ ttl }) => {
          return vec3.fromValues(ttl * 0.5, ttl * 0.5, ttl * 0.5);
        },
        colorFilter: ({ ttl, colorFilter }) => {
          // Fade out over time
          return vec4.fromValues(
            colorFilter[0],
            colorFilter[1],
            colorFilter[2],
            ttl,
          );
        },
      },
    });
    this.particles.applyTexture(engine, asteroidTexture);

    this.rootComponent.transform.translation = vec3.fromValues(0.75, -0.5, -3);
  }
}

class Fiery extends TActor {
  public static resources: TResourcePackConfig = {
    textures: [asteroidTexture],
  };

  public particles: TParticlesComponent;

  constructor(engine: TEngine) {
    super();

    this.particles = new TParticlesComponent(engine, this, 0.2, 0.2, {
      emitter: {
        maxParticles: 500,
        maxEmitRate: 200,
        minEmitRate: 50,
      },
      initializers: {
        ttl: 1,
        position: () => {
          return vec3.fromValues(0, 0, 0);
        },
        velocity: () => {
          // Mostly going up, some slight angle
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 0.02 + 0.02;

          return vec3.fromValues(
            Math.cos(angle) * speed * 0.1,
            Math.abs(Math.sin(angle) * speed) * 0.3,
            0,
          );
        },
        rotation: () => {
          const randomRotation = Math.random() * Math.PI * 2;
          const randomRotationInDegrees = randomRotation * (180 / Math.PI);
          return quat.fromEuler(quat.create(), 0, 0, randomRotationInDegrees);
        },
        scale: () => {
          const randomScale = Math.random() * 0.2 + 0.4;
          return vec3.fromValues(randomScale, randomScale, randomScale);
        },
        colorFilter: () => {
          // Random between red and orange
          const random = Math.random();
          return vec4.fromValues(1, random * 0.5, 0, 1);
        },
      },
      behaviours: {
        scale: ({ ttl }) => {
          return vec3.fromValues(ttl * 0.5, ttl * 0.5, ttl * 0.5);
        },
        colorFilter: ({ ttl, colorFilter }) => {
          // Fade out over time
          return vec4.fromValues(
            colorFilter[0],
            colorFilter[1],
            colorFilter[2],
            ttl,
          );
        },
      },
    });
    this.particles.applyTexture(engine, asteroidTexture);

    this.rootComponent.transform.translation = vec3.fromValues(-0.75, -0.5, -3);
  }
}

class SpriteState extends TGameState {
  public async onCreate(engine: TEngine) {
    const rp = new TResourcePack(engine, ManyColors.resources, Fiery.resources);

    await rp.load();

    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const manyColors = new ManyColors(engine);
    this.addActor(manyColors);

    const fiery = new Fiery(engine);
    this.addActor(fiery);

    const section = engine.debugPanel.addSection('Particles', true);
    section.addButtons('System 1', {
      label: 'Pause',
      onClick: (button) => {
        if (fiery.particles.paused) {
          fiery.particles.resume();
          button.label = 'Pause';
        } else {
          fiery.particles.pause();
          button.label = 'Resume';
        }
      },
    });

    section.addButtons('System 2', {
      label: 'Pause',
      onClick: (button) => {
        if (manyColors.particles.paused) {
          manyColors.particles.resume();
          button.label = 'Pause';
        } else {
          manyColors.particles.pause();
          button.label = 'Resume';
        }
      },
    });
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
