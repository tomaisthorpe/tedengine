import asteroidTexture from '@assets/asteroid.png';
import { quat, vec3, vec4 } from 'gl-matrix';
import type { TTexture } from '@tedengine/ted';
import {
  TGameState,
  TResourcePack,
  TEngine,
  TParticlesComponent,
  TSpriteLayer,
  TOriginPoint,
  TSpriteComponent,
  TTransformComponent,
  TTextureComponent,
  TTransform,
  TVisibilityComponent,
  TSpriteInstancesComponent,
  TParticlesSystem,
  TTransformBundle,
} from '@tedengine/ted';

class SpriteState extends TGameState {
  public async onCreate(engine: TEngine) {
    const rp = new TResourcePack(engine, {
      textures: [asteroidTexture],
    });

    await rp.load();

    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    this.world.addSystem(new TParticlesSystem(this.world));

    const colorParticles = new TParticlesComponent({
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

    const manyColors = this.world.createEntity();
    this.world.addComponents(manyColors, [
      TTransformBundle,
      new TTextureComponent(engine.resources.get<TTexture>(asteroidTexture)!),
      new TSpriteComponent({
        width: 0.2,
        height: 0.2,
        origin: TOriginPoint.Center,
        layer: TSpriteLayer.Foreground_0,
      }),
      new TTransformComponent(new TTransform(vec3.fromValues(0.75, -0.5, -3))),
      colorParticles,
      new TVisibilityComponent(),
      new TSpriteInstancesComponent([]),
    ]);

    const fieryParticles = new TParticlesComponent({
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
    const fiery = this.world.createEntity();
    this.world.addComponents(fiery, [
      TTransformBundle,
      new TTextureComponent(engine.resources.get<TTexture>(asteroidTexture)!),
      new TSpriteComponent({
        width: 0.2,
        height: 0.2,
        origin: TOriginPoint.Center,
        layer: TSpriteLayer.Foreground_0,
      }),
      new TTransformComponent(new TTransform(vec3.fromValues(-0.75, -0.5, -3))),
      fieryParticles,
      new TVisibilityComponent(),
      new TSpriteInstancesComponent([]),
    ]);

    const section = engine.debugPanel.addSection('Particles', true);
    section.addButtons('System 1', {
      label: 'Pause',
      onClick: (button) => {
        if (fieryParticles.paused) {
          fieryParticles.paused = false;
          button.label = 'Pause';
        } else {
          fieryParticles.paused = true;
          button.label = 'Resume';
        }
      },
    });

    section.addButtons('System 2', {
      label: 'Pause',
      onClick: (button) => {
        if (colorParticles.paused) {
          colorParticles.paused = false;
          button.label = 'Pause';
        } else {
          colorParticles.paused = true;
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
