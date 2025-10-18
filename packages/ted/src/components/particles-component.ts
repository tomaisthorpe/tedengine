import { vec3 } from 'gl-matrix';
import type { TWorld } from '../core/world';
import type { TEngine } from '../engine/engine';
import { TComponent } from '../core/component';
import type { TEntityQuery } from '../core/entity-query';
import { TTransform } from '../math/transform';
import { TSystem, TSystemPriority } from '../core/system';
import { TSpriteInstancesComponent } from './sprite-component';
import type { quat, vec4 } from 'gl-matrix';

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

export class TParticlesComponent extends TComponent {
  public particles: TParticle[] = [];

  public timeSinceLastEmit = 0;
  public paused = false;

  constructor(public systemConfig: TParticleSystemConfig) {
    super();
  }
}

export class TParticlesSystem extends TSystem {
  public readonly priority: number = TSystemPriority.Update;

  private query: TEntityQuery;

  constructor(private world: TWorld) {
    super();

    this.query = world.createQuery([
      TParticlesComponent,
      TSpriteInstancesComponent,
    ]);
  }

  public async update(
    engine: TEngine,
    world: TWorld,
    delta: number,
  ): Promise<void> {
    const entities = this.query.execute();

    for (const entity of entities) {
      const components = world.getComponents(entity);
      if (!components) continue;

      const particlesComponent = components.get(TParticlesComponent);
      const spriteInstancesComponent = components.get(
        TSpriteInstancesComponent,
      );

      if (!particlesComponent || !spriteInstancesComponent) continue;

      const { particles, timeSinceLastEmit, paused } = particlesComponent;
      const { behaviours, emitter, initializers } =
        particlesComponent.systemConfig;

      updateParticles(particles, behaviours, delta);

      if (!paused) {
        particlesComponent.timeSinceLastEmit = emitParticles(
          particles,
          emitter,
          initializers,
          timeSinceLastEmit + delta,
        );
      }

      updateSpriteInstances(spriteInstancesComponent, particles);
    }
  }
}

function updateSpriteInstances(
  spriteInstancesComponent: TSpriteInstancesComponent,
  particles: TParticle[],
) {
  spriteInstancesComponent.instances = particles.map((particle) => ({
    transform: particle.transform,
    colorFilter: particle.colorFilter,
  }));
}

function updateParticles(
  particles: TParticle[],
  behaviours: TParticleBehaviours | undefined,
  delta: number,
) {
  for (const particle of particles) {
    if (behaviours?.force) {
      const force = vec3.scale(
        vec3.create(),

        typeof behaviours.force === 'function'
          ? behaviours.force(particle)
          : behaviours.force,
        delta,
      );

      particle.velocity = vec3.add(vec3.create(), particle.velocity, force);
    }

    if (behaviours?.scale) {
      const scale =
        typeof behaviours.scale === 'function'
          ? behaviours.scale(particle)
          : behaviours.scale;

      particle.transform.scale = scale;
    }

    particle.transform.translation = vec3.add(
      vec3.create(),
      particle.transform.translation,
      particle.velocity,
    );

    if (behaviours?.colorFilter) {
      const colorFilter =
        typeof behaviours.colorFilter === 'function'
          ? behaviours.colorFilter(particle)
          : behaviours.colorFilter;

      particle.colorFilter = colorFilter;
    }

    if (particle.ttl) {
      particle.ttl -= delta;
      if (particle.ttl <= 0) {
        particles.splice(particles.indexOf(particle), 1);
      }
    }
  }
}

function emitParticles(
  particles: TParticle[],
  emitter: TEmitterConfig,
  initializers: TParticleInitializers,
  timeSinceLastEmit: number,
): number {
  // Emit new particles, if not paused
  const emitRate = getEmitRate(emitter);
  const particlesToEmit = Math.floor(timeSinceLastEmit * emitRate);

  for (let i = 0; i < particlesToEmit; i++) {
    if (particles.length < emitter.maxParticles) {
      addParticle(particles, initializers);
    }
  }

  return timeSinceLastEmit - particlesToEmit / emitRate;
}

function getEmitRate(emitter: TEmitterConfig): number {
  const { maxEmitRate, minEmitRate } = emitter;
  return minEmitRate + Math.random() * (maxEmitRate - minEmitRate);
}

function addParticle(
  particles: TParticle[],
  initializers: TParticleInitializers,
) {
  const particle: TParticle = {
    transform: new TTransform(),
    velocity: vec3.create(),
  };

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

  particles.unshift(particle);
}
