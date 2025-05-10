import { vec3 } from 'gl-matrix';
import type TEngine from '../engine/engine';
import type {
  TPhysicsBodyOptions,
  TPhysicsQueryOptions,
  TPhysicsQueryLineResult,
  TPhysicsQueryAreaResult,
  TPhysicsWorldDebug,
} from '../physics/physics-world';
import type { TSerializedLighting } from '../renderer/frame-params';
import {
  TRenderTask,
  type TSerializedRenderTask,
} from '../renderer/frame-params';
import type { TPhysicsRegisterBody } from '../physics/state-changes';
import { TPhysicsMessageTypes } from '../physics/messages';
import type {
  TPhysicsApplyCentralForce,
  TPhysicsStateChange,
  TPhysicsApplyCentralImpulse,
  TPhysicsUpdateBodyOptions,
  TPhysicsUpdateTransform,
  TPhysicsRemoveBody,
} from '../physics/state-changes';
import { TPhysicsStateChangeType } from '../physics/state-changes';
import { createPhysicsWorker } from '../physics/create-worker';
import { TJobContextTypes } from '../jobs/context-types';
import type TJobManager from '../jobs/job-manager';
import type { TJobsMessageRelayResult } from '../jobs/messages';
import { TMessageTypesJobs } from '../jobs/messages';
import type TGameState from './game-state';
import type { TPhysicsSimulateStepResult } from '../physics/jobs';
import type { TComponent, TComponentConstructor } from './component';
import { TComponentContainer } from './component';
import { TEntityQuery } from './entity-query';
import type { TSystem } from './system';
import {
  TMeshLoadSystem,
  TSpriteLoadSystem,
  TTexturedMeshLoadSystem,
} from '../graphics/mesh-load-system';
import { TMeshRenderSystem } from '../graphics/render-tasks-system';
import { TAnimatedSpriteSystem } from '../components/animated-sprite-component';
import TCameraSystem from '../cameras/camera-system';
import type { TRigidBodyComponent } from '../physics/rigid-body-component';
import type TTransform from '../math/transform';
import { TPhysicsSystem } from '../physics/physics-system';
import { TBundle } from './bundle';

/**
 * An entity is a unique identifier for a game object.
 */
export type TEntity = number;

export interface TWorldConfig {
  mode?: TPhysicsMode;
  gravity: vec3;
  defaultCollisionClass: string;
  collisionClasses: TCollisionClass[];
  physicsScale?: number;
  lighting?: TSerializedLighting;
}

export type TPhysicsMode = '2d' | '3d';

export interface TCollisionClass {
  name: string;
  ignores?: string[];
}

export default class TWorld {
  private entities: Map<TEntity, TComponentContainer> = new Map();
  public systems: TSystem[] = [];
  private nextEntityId = 0;

  private worker?: Worker;
  public config: TWorldConfig = {
    gravity: vec3.fromValues(0, -9.82, 0),
    defaultCollisionClass: 'Solid',
    collisionClasses: [
      { name: 'Solid' },
      { name: 'NoCollide', ignores: ['Solid'] },
    ],
  };
  private workerPort?: MessagePort;

  private paused = false;

  // @todo should we store the class in the actor, or get it from the collider instead?
  private collisionClassLookup: { [key: string]: string } = {};

  // List of state changes and bodies to send to physics worker on next step
  private queuedStateChanges: TPhysicsStateChange[] = [];
  private queuedNewBodies: TPhysicsRegisterBody[] = [];
  private queuedRemoveBodies: TPhysicsRemoveBody[] = [];

  private onCreatedResolve?: () => void;

  private lastPhysicsDebug?: TPhysicsWorldDebug;
  public physicsDebug = false;

  private renderSystem!: TMeshRenderSystem;
  public cameraSystem!: TCameraSystem;

  private jobs: TJobManager;
  constructor(
    private engine: TEngine,
    public gameState: TGameState,
  ) {
    this.jobs = gameState.jobs;
  }

  /**
   * Creates an entity with the given components or bundles
   * Order of the components matters, if a component is added to an entity
   * and then a bundle that also contains that component, the component in the bundle
   * will override the component in the entity.
   *
   * @param componentsOrBundles - The components or bundles to add to the entity
   * @returns The entity id
   */
  public createEntity(componentsOrBundles?: (TComponent | TBundle)[]): TEntity {
    const entity = this.nextEntityId;
    this.nextEntityId++;

    const components = this.collectComponents(componentsOrBundles);
    this.entities.set(entity, new TComponentContainer(components));

    return entity;
  }

  private collectComponents(
    componentsOrBundles?: (TComponent | TBundle)[],
  ): TComponent[] {
    const components: TComponent[] = [];
    if (componentsOrBundles) {
      for (const item of componentsOrBundles) {
        if (item instanceof TBundle) {
          components.push(...item.createComponents());
        } else {
          components.push(item);
        }
      }
    }
    return components;
  }

  public removeEntity(entity: TEntity): void {
    this.entities.delete(entity);
  }

  public addComponent(
    entity: TEntity,
    componentOrBundle: TComponent | TBundle,
  ): void {
    this.addComponents(entity, [componentOrBundle]);
  }

  public addComponents(
    entity: TEntity,
    componentsOrBundles: (TComponent | TBundle)[],
  ): void {
    const components = this.collectComponents(componentsOrBundles);
    for (const component of components) {
      this.entities.get(entity)?.add(component);
    }
  }

  public removeComponent(
    entity: TEntity,
    componentClass: TComponentConstructor,
  ): void {
    this.entities.get(entity)?.remove(componentClass);
  }

  public addSystem(system: TSystem): void {
    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
  }

  public removeSystem(system: TSystem): void {
    this.systems.splice(this.systems.indexOf(system), 1);
  }

  public getComponent<T extends TComponent>(
    entity: TEntity,
    componentClass: TComponentConstructor<T>,
  ): T | undefined {
    return this.entities.get(entity)?.get(componentClass);
  }

  public getComponents(entity: TEntity): TComponentContainer | undefined {
    return this.entities.get(entity);
  }

  public createQuery(components: TComponentConstructor[]): TEntityQuery {
    return new TEntityQuery(this, components);
  }

  public queryEntities(
    components: TComponentConstructor[],
    excludedComponents: TComponentConstructor[] = [],
  ): TEntity[] {
    return Array.from(this.entities.keys()).filter((entity) => {
      const entityComponents = this.getComponents(entity);
      if (!entityComponents) return false;

      return (
        entityComponents.hasAll(components) &&
        !entityComponents.hasAny(excludedComponents)
      );
    });
  }

  public async create(): Promise<void> {
    return new Promise<void>((resolve) => {
      // Add default systems
      this.addSystem(new TMeshLoadSystem(this));
      this.addSystem(new TTexturedMeshLoadSystem(this));
      this.addSystem(new TSpriteLoadSystem(this));
      this.addSystem(new TAnimatedSpriteSystem(this));
      this.addSystem(new TPhysicsSystem(this, this.gameState.events));
      this.renderSystem = new TMeshRenderSystem(this);
      this.addSystem(this.renderSystem);

      this.cameraSystem = new TCameraSystem(this, this.engine);
      this.addSystem(this.cameraSystem);

      this.onCreatedResolve = resolve;
      this.worker = createPhysicsWorker();
      this.worker.onmessage = this.onMessage.bind(this);
    });
  }

  public registerRigidBody(
    entity: TEntity,
    body: TRigidBodyComponent,
    transform: TTransform,
  ) {
    // @todo entities don't use uuids, we need to find a better way to do this
    // @todo transform should be the world transform
    const sc: TPhysicsRegisterBody = {
      uuid: entity.toString(),
      collider: body.collider,
      translation: [
        transform.translation[0],
        transform.translation[1],
        transform.translation[2],
      ],
      rotation: [
        transform.rotation[0],
        transform.rotation[1],
        transform.rotation[2],
        transform.rotation[3],
      ],
      options: body.physicsOptions,
    };

    this.queuedNewBodies.push(sc);

    this.collisionClassLookup[entity.toString()] =
      body.collider.collisionClass || this.config.defaultCollisionClass;
  }

  public removeRigidBody(entity: TEntity) {
    const sc: TPhysicsRemoveBody = {
      type: TPhysicsStateChangeType.REMOVE_BODY,
      uuid: entity.toString(),
    };
    this.queuedRemoveBodies.push(sc);
  }

  private onMessage(event: MessageEvent) {
    const { data } = event;
    switch (data.type) {
      case TPhysicsMessageTypes.INIT:
        this.workerPort = event.ports[0];
        this.workerPort.onmessage = this.onMessage.bind(this);

        this.jobs.setRelay([TJobContextTypes.Physics], this.workerPort);

        this.setupWorld();
        break;
      case TMessageTypesJobs.RELAY_RESULT: {
        const relayResultMessage = data as TJobsMessageRelayResult;
        this.jobs.onRelayedResult(relayResultMessage.wrappedResult);
        break;
      }
    }
  }

  /**
   * Sends the world config once the worker has been created
   */
  private async setupWorld() {
    await this.jobs.do<void>({ type: 'create_world', args: [this.config] });

    if (this.onCreatedResolve) {
      this.onCreatedResolve();
    }
  }

  public async simulateStep(
    delta: number,
  ): Promise<TPhysicsSimulateStepResult> {
    // Copy the queued state changes
    const stateChanges = [...this.queuedStateChanges];
    const newBodies = [...this.queuedNewBodies];
    const removeBodies = [...this.queuedRemoveBodies];

    // Clear the queued state changes
    this.queuedNewBodies = [];
    this.queuedRemoveBodies = [];
    this.queuedStateChanges = [];

    const result = await this.jobs.do<TPhysicsSimulateStepResult>({
      type: 'simulate_step',
      args: [delta, newBodies, removeBodies, stateChanges, this.physicsDebug],
    });

    this.lastPhysicsDebug = result.debug;

    return result;
  }
  /**
   * Called every frame with delta and triggers update on all actors
   */
  public async update(_: TEngine, delta: number): Promise<void> {
    if (this.paused) {
      return;
    }

    for (const system of this.systems) {
      await system.update(this.engine, this, delta);
    }
  }

  public getLighting(): TSerializedLighting {
    return this.config.lighting || {};
  }

  public getRenderTasks(): TSerializedRenderTask[] {
    const tasks: TSerializedRenderTask[] = [];

    if (this.physicsDebug && this.lastPhysicsDebug) {
      tasks.push({
        type: TRenderTask.PhysicsDebug,
        uuid: 'physics-debug',
        vertices: this.lastPhysicsDebug?.vertices,
        colors: this.lastPhysicsDebug?.colors,
      });
    }

    return [...tasks, ...this.renderSystem.renderTasks];
  }

  /**
   * Called when a state is entered so the world updates should continue
   */
  public start() {
    this.paused = false;
  }

  /**
   * Called when a state is moved out of the active state so world updates should stop
   */
  public pause() {
    this.paused = true;
  }

  public destroy() {
    this.worker?.terminate();
  }

  public applyCentralForce(entity: TEntity, force: vec3) {
    const sc: TPhysicsApplyCentralForce = {
      type: TPhysicsStateChangeType.APPLY_CENTRAL_FORCE,
      uuid: entity.toString(),
      force,
    };
    this.queuePhysicsStateChange(sc);
  }

  public applyCentralImpulse(entity: TEntity, impulse: vec3) {
    const sc: TPhysicsApplyCentralImpulse = {
      type: TPhysicsStateChangeType.APPLY_CENTRAL_IMPULSE,
      uuid: entity.toString(),
      impulse,
    };
    this.queuePhysicsStateChange(sc);
  }

  private queuePhysicsStateChange(stateChange: TPhysicsStateChange) {
    this.queuedStateChanges.push(stateChange);
  }

  public updateBodyOptions(entity: TEntity, options: TPhysicsBodyOptions) {
    // @todo check if this body is registered yet, if not, we can just wait until it's registered
    const sc: TPhysicsUpdateBodyOptions = {
      type: TPhysicsStateChangeType.UPDATE_BODY_OPTIONS,
      uuid: entity.toString(),
      options,
    };
    this.queuePhysicsStateChange(sc);
  }

  public updateTransform(entity: TEntity, transform: TTransform) {
    const sc: TPhysicsUpdateTransform = {
      type: TPhysicsStateChangeType.UPDATE_TRANSFORM,
      uuid: entity.toString(),
      translation: [
        transform.translation[0],
        transform.translation[1],
        transform.translation[2],
      ],
      rotation: [
        transform.rotation[0],
        transform.rotation[1],
        transform.rotation[2],
        transform.rotation[3],
      ],
    };
    this.queuePhysicsStateChange(sc);
  }

  public async queryLine(
    from: vec3,
    to: vec3,
    options?: TPhysicsQueryOptions,
  ): Promise<TWorldQueryLineResult[]> {
    const hits = (await this.jobs.do({
      type: 'query_line',
      args: [from, to, options],
    })) as TPhysicsQueryLineResult[];

    const result: TWorldQueryLineResult[] = [];

    for (const hit of hits) {
      result.push({
        distance: hit.distance,
        entity: parseInt(hit.uuid),
      });
    }

    return result;
  }

  public async queryArea(
    from: vec3,
    to: vec3,
    options?: TPhysicsQueryOptions,
  ): Promise<TWorldQueryAreaResult[]> {
    const hits = (await this.jobs.do({
      type: 'query_area',
      args: [from, to, options],
    })) as TPhysicsQueryAreaResult[];

    const result: TWorldQueryAreaResult[] = [];

    for (const hit of hits) {
      result.push({
        entity: parseInt(hit.uuid),
      });
    }

    return result;
  }
}

export interface TWorldQueryLineResult {
  entity: TEntity;
  distance: number;
}

export interface TWorldQueryAreaResult {
  entity: TEntity;
}
