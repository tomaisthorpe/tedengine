import type { mat4, quat, vec4 } from 'gl-matrix';
import { vec3 } from 'gl-matrix';
import type TActor from '../core/actor';
import type TEngine from '../engine/engine';
import TTransform from '../math/transform';
import type { TPhysicsBodyOptions } from '../physics/physics-world';
import type { TSerializedTexturedMaterial } from '../renderer/frame-params';
import {
  TRenderTask,
  type TSerializedRenderTask,
  type TSerializedSpriteInstances,
} from '../renderer/frame-params';
import { TSpriteLayer } from './sprite-component';
import TSpriteComponent, { TOriginPoint } from './sprite-component';
import type { TActorComponentWithOnUpdate } from './actor-component';

export type TParticleConfigVec3 = vec3 | (() => vec3);
export type TParticleConfigQuat = quat | (() => quat);
export type TParticleConfigNumber = number | (() => number);
export type TParticleConfigVec4 = vec4 | (() => vec4);

export type TParticleBehaviourConfigVec3 =
  | vec3
  | ((particle: TParticle) => vec3);
export type TParticleBehaviourConfigVec4 =
  | vec4
  | ((particle: TParticle) => vec4);

export interface TParticleInitializers {
  position?: TParticleConfigVec3;
  rotation?: TParticleConfigQuat;
  velocity?: TParticleConfigVec3;
  ttl?: TParticleConfigNumber;
  scale?: TParticleConfigVec3;
  colorFilter?: TParticleConfigVec4;
}

export interface TParticleBehaviours {
  force?: TParticleBehaviourConfigVec3;
  scale?: TParticleBehaviourConfigVec3;
  colorFilter?: TParticleBehaviourConfigVec4;
}

export interface TEmitterConfig {
  maxParticles: number;
  maxEmitRate: number;
  minEmitRate: number;
}

export interface TParticleSystemConfig {
  initializers: TParticleInitializers;
  emitter: TEmitterConfig;
  behaviours?: TParticleBehaviours;
}

export interface TParticle {
  transform: TTransform;
  ttl?: number;
  velocity: vec3;
  colorFilter?: vec4;
}

export default class TParticlesComponent
  extends TSpriteComponent
  implements TActorComponentWithOnUpdate
{
  private particles: TParticle[] = [];
  private systemConfig: TParticleSystemConfig;
  private timeSinceLastEmit = 0;
  private _paused = false;

  public get paused() {
    return this._paused;
  }

  constructor(
    engine: TEngine,
    actor: TActor,
    particleWidth: number,
    particleHeight: number,
    systemConfig: TParticleSystemConfig,
    layer: TSpriteLayer = TSpriteLayer.Foreground_0,
    bodyOptions?: TPhysicsBodyOptions,
  ) {
    super(
      engine,
      actor,
      particleWidth,
      particleHeight,
      TOriginPoint.Center,
      layer,
      bodyOptions,
    );

    this.systemConfig = systemConfig;
  }

  public pause() {
    this._paused = true;
  }

  public resume() {
    this._paused = false;
  }

  public override getRenderTask(): TSerializedRenderTask | undefined {
    const instances: {
      transform: mat4;
      material?: TSerializedTexturedMaterial;
    }[] = [];
    const componentTransform = this.getWorldTransform();
    for (const particle of this.particles) {
      instances.push({
        transform: componentTransform.add(particle.transform).getMatrix(),
        material: particle.colorFilter
          ? {
              type: 'textured',
              options: {
                texture: this.texture.uuid!,
                colorFilter: particle.colorFilter,
              },
            }
          : undefined,
      });
    }

    return {
      type: TRenderTask.SpriteInstances,
      uuid: this.mesh.uuid,
      instances,
      material: {
        type: 'textured',
        options: {
          texture: this.texture.uuid!,
        },
      },
      layer: this.layer,
    } as TSerializedSpriteInstances;
  }

  public async onUpdate(engine: TEngine, delta: number): Promise<void> {
    // Update existing particles
    for (const particle of this.particles) {
      if (this.systemConfig.behaviours?.force) {
        const force = vec3.scale(
          vec3.create(),

          typeof this.systemConfig.behaviours.force === 'function'
            ? this.systemConfig.behaviours.force(particle)
            : this.systemConfig.behaviours.force,
          delta,
        );

        particle.velocity = vec3.add(vec3.create(), particle.velocity, force);
      }

      if (this.systemConfig.behaviours?.scale) {
        const scale =
          typeof this.systemConfig.behaviours.scale === 'function'
            ? this.systemConfig.behaviours.scale(particle)
            : this.systemConfig.behaviours.scale;

        particle.transform.scale = scale;
      }

      particle.transform.translation = vec3.add(
        vec3.create(),
        particle.transform.translation,
        particle.velocity,
      );

      if (this.systemConfig.behaviours?.colorFilter) {
        const colorFilter =
          typeof this.systemConfig.behaviours.colorFilter === 'function'
            ? this.systemConfig.behaviours.colorFilter(particle)
            : this.systemConfig.behaviours.colorFilter;

        particle.colorFilter = colorFilter;
      }

      if (particle.ttl) {
        particle.ttl -= delta;
        if (particle.ttl <= 0) {
          this.particles.splice(this.particles.indexOf(particle), 1);
        }
      }
    }

    // Emit new particles, if not paused
    if (!this.paused) {
      this.timeSinceLastEmit += delta;
      const emitRate = this.getEmitRate();
      const particlesToEmit = Math.floor(this.timeSinceLastEmit * emitRate);

      for (let i = 0; i < particlesToEmit; i++) {
        if (this.particles.length < this.systemConfig.emitter.maxParticles) {
          this.addParticle();
        }
      }

      this.timeSinceLastEmit -= particlesToEmit / emitRate;
    }
  }

  private getEmitRate(): number {
    const { maxEmitRate, minEmitRate } = this.systemConfig.emitter;
    return minEmitRate + Math.random() * (maxEmitRate - minEmitRate);
  }

  private addParticle() {
    const particle: TParticle = {
      transform: new TTransform(),
      velocity: vec3.create(),
    };

    const { initializers } = this.systemConfig;

    if (initializers.position) {
      particle.transform.translation =
        typeof initializers.position === 'function'
          ? initializers.position()
          : initializers.position;
    }

    if (initializers.rotation) {
      particle.transform.rotation =
        typeof initializers.rotation === 'function'
          ? initializers.rotation()
          : initializers.rotation;
    }

    if (initializers.scale) {
      particle.transform.scale =
        typeof initializers.scale === 'function'
          ? initializers.scale()
          : initializers.scale;
    }

    if (initializers.velocity) {
      particle.velocity =
        typeof initializers.velocity === 'function'
          ? initializers.velocity()
          : initializers.velocity;
    }

    if (initializers.ttl) {
      particle.ttl =
        typeof initializers.ttl === 'function'
          ? initializers.ttl()
          : initializers.ttl;
    }

    if (initializers.colorFilter) {
      particle.colorFilter =
        typeof initializers.colorFilter === 'function'
          ? initializers.colorFilter()
          : initializers.colorFilter;
    }

    this.particles.unshift(particle);
  }
}
