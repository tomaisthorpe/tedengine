import type { mat4, quat } from 'gl-matrix';
import { vec3 } from 'gl-matrix';
import type TActor from '../core/actor';
import type TEngine from '../engine/engine';
import TTransform from '../math/transform';
import type { TPhysicsBodyOptions } from '../physics/physics-world';
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

export type TParticleBehaviourConfigVec3 = vec3 | ((ttl?: number) => vec3);

export interface TParticleInitializers {
  position?: TParticleConfigVec3;
  rotation?: TParticleConfigQuat;
  velocity?: TParticleConfigVec3;
  ttl?: TParticleConfigNumber;
  scale?: TParticleConfigVec3;
}

export interface TParticleBehaviours {
  force?: TParticleBehaviourConfigVec3;
  scale?: TParticleBehaviourConfigVec3;
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
}

export default class TParticlesComponent
  extends TSpriteComponent
  implements TActorComponentWithOnUpdate
{
  private particles: TParticle[] = [];
  private systemConfig: TParticleSystemConfig;
  private timeSinceLastEmit = 0;

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

  public override getRenderTask(): TSerializedRenderTask | undefined {
    const transforms: mat4[] = [];
    const componentTransform = this.getWorldTransform();
    for (const particle of this.particles) {
      transforms.push(componentTransform.add(particle.transform).getMatrix());
    }

    return {
      type: TRenderTask.SpriteInstances,
      uuid: this.mesh.uuid,
      transforms,
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
            ? this.systemConfig.behaviours.force(particle.ttl)
            : this.systemConfig.behaviours.force,
          delta,
        );

        particle.velocity = vec3.add(vec3.create(), particle.velocity, force);
      }

      if (this.systemConfig.behaviours?.scale) {
        const scale =
          typeof this.systemConfig.behaviours.scale === 'function'
            ? this.systemConfig.behaviours.scale(particle.ttl)
            : this.systemConfig.behaviours.scale;

        particle.transform.scale = scale;
      }

      particle.transform.translation = vec3.add(
        vec3.create(),
        particle.transform.translation,
        particle.velocity,
      );

      if (particle.ttl) {
        particle.ttl -= delta;
        if (particle.ttl <= 0) {
          this.particles.splice(this.particles.indexOf(particle), 1);
        }
      }
    }

    // Emit new particles
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

    this.particles.push(particle);
  }
}
