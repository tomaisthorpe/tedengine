import { quat, vec3 } from 'gl-matrix';
import type TEngine from '../engine/engine';
import type {
  TPhysicsBody,
  TPhysicsBodyOptions,
  TPhysicsCollision,
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
import type TActor from './actor';
import type { TPhysicsRegisterBody } from '../physics/state-changes';
import { TPhysicsMessageTypes } from '../physics/messages';
import type TSceneComponent from '../actor-components/scene-component';
import type { TActorWithOnWorldAdd } from './actor';
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

const actorHasOnWorldAdd = (state: TActor): state is TActorWithOnWorldAdd =>
  (state as TActorWithOnWorldAdd).onWorldAdd !== undefined;

export type TCollisionCallback = (actor: TActor) => void;

export interface TCollisionListener {
  componentUUID: string;
  collisionClass?: string;
  handler: TCollisionCallback;
}

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

export interface TWorldUpdateStats {
  worldUpdateTime: number;
  physicsTotalTime: number;
  physicsStepTime: number;
  actorUpdateTime: number;
}

export default class TWorld {
  public actors: TActor[] = [];

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

  private lastDelta = 0;
  private updateStartTime = 0;

  private onCreatedResolve?: () => void;

  private collisionListeners: { [key: string]: TCollisionListener[] } = {};

  private lastPhysicsDebug?: TPhysicsWorldDebug;
  public physicsDebug = false;

  private jobs: TJobManager;
  constructor(
    private engine: TEngine,
    public gameState: TGameState,
  ) {
    this.jobs = gameState.jobs;
  }

  public async create(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.onCreatedResolve = resolve;
      this.worker = createPhysicsWorker();
      this.worker.onmessage = this.onMessage.bind(this);
    });
  }

  /**
   * Adds actor to the world
   *
   * @param actor
   */
  public addActor(actor: TActor): void {
    actor.world = this;
    this.actors.push(actor);

    this.registerActorWithPhysicsWorker(actor);

    if (actorHasOnWorldAdd(actor)) {
      actor.onWorldAdd(this.engine, this);
    }
  }

  public removeActor(actor: TActor): void {
    const index = this.actors.indexOf(actor);
    if (index === -1) return;

    this.actors.splice(index, 1);

    this.removeActorFromPhysicsWorker(actor);

    actor.world = undefined;
  }

  private removeActorFromPhysicsWorker(actor: TActor) {
    // Remove the root component
    const component = actor.rootComponent;

    // If there is no collider, it definitely won't be in the physics world
    if (!component.collider) return;

    const sc: TPhysicsRemoveBody = {
      type: TPhysicsStateChangeType.REMOVE_BODY,
      uuid: component.uuid,
    };

    this.queuedRemoveBodies.push(sc);

    // Remove any listeners that have been registered
    delete this.collisionListeners[component.uuid];
  }

  private registerActorWithPhysicsWorker(actor: TActor) {
    // Register only the root component
    const component = actor.rootComponent;

    if (!component.collider) return;

    const transform = component.getWorldTransform();
    const colliderConfig = component.collider.getConfig();

    this.queuedNewBodies.push({
      uuid: component.uuid,
      collider: colliderConfig,
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
      options: component.bodyOptions,
    });

    this.collisionClassLookup[component.uuid] =
      colliderConfig.collisionClass || this.config.defaultCollisionClass;
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

  /**
   * Called every frame with delta and triggers update on all actors
   */
  public async update(_: TEngine, delta: number): Promise<TWorldUpdateStats> {
    if (this.paused) {
      return {
        worldUpdateTime: 0,
        physicsStepTime: 0,
        physicsTotalTime: 0,
        actorUpdateTime: 0,
      };
    }

    this.updateStartTime = performance.now();
    this.lastDelta = delta;

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

    const stats = this.onPhysicsUpdate(
      result.bodies,
      result.collisions,
      result.stepElapsedTime,
    );

    return stats;
  }

  public getLighting(): TSerializedLighting {
    return this.config.lighting || {};
  }

  public getRenderTasks(): TSerializedRenderTask[] {
    const tasks: TSerializedRenderTask[] = [];

    for (const actor of this.actors) {
      tasks.push(...actor.getRenderTasks());
    }

    if (this.physicsDebug && this.lastPhysicsDebug) {
      tasks.push({
        type: TRenderTask.PhysicsDebug,
        uuid: 'physics-debug',
        vertices: this.lastPhysicsDebug?.vertices,
        colors: this.lastPhysicsDebug?.colors,
      });
    }

    return tasks;
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

  private onPhysicsUpdate(
    worldState: TPhysicsBody[],
    collisions: TPhysicsCollision[],
    stepElapsedTime: number,
  ): TWorldUpdateStats {
    for (const obj of worldState) {
      // Find the actor with root component with this uuid
      for (const actor of this.actors) {
        if (actor.rootComponent.uuid === obj.uuid) {
          actor.rootComponent.transform.translation = vec3.fromValues(
            ...obj.translation,
          );
          actor.rootComponent.transform.rotation = quat.fromValues(
            ...obj.rotation,
          );

          // @todo should we just update the linear and angular velocity here?
          actor.rootComponent.updatePhysicsBody(obj);

          break;
        }
      }
    }

    for (const collision of collisions) {
      // Check if either body has a listener waiting
      this.checkCollision(collision.bodies[0], collision.bodies[1]);
      this.checkCollision(collision.bodies[1], collision.bodies[0]);
    }

    const startActorUpdate = performance.now();
    const physicsElapsedTime = startActorUpdate - this.updateStartTime;

    for (const actor of this.actors) {
      actor.update(this.engine, this.lastDelta);
    }

    const afterActorUpdate = performance.now();

    const stats: TWorldUpdateStats = {
      worldUpdateTime: afterActorUpdate - this.updateStartTime,
      physicsTotalTime: physicsElapsedTime,
      physicsStepTime: stepElapsedTime,
      actorUpdateTime: afterActorUpdate - startActorUpdate,
    };

    return stats;
  }

  private checkCollision(bodyA: string, bodyB: string) {
    const listeners = this.collisionListeners[bodyA];
    if (!listeners) return;

    for (const listener of listeners) {
      // Just incase wasn't supplied
      if (!listener.collisionClass) continue;

      // Check if the collision class matches what the listener is looking for
      if (this.collisionClassLookup[bodyB] !== listener.collisionClass) {
        continue;
      }

      const actor = this.actors.find(
        (actor) => actor.rootComponent.uuid === bodyB,
      );

      if (actor) {
        listener.handler(actor);
      }
    }
  }

  public destroy() {
    this.worker?.terminate();
  }

  public applyCentralForce(component: TSceneComponent, force: vec3) {
    const sc: TPhysicsApplyCentralForce = {
      type: TPhysicsStateChangeType.APPLY_CENTRAL_FORCE,
      uuid: component.uuid,
      force,
    };
    this.queuePhysicsStateChange(sc);
  }

  public applyCentralImpulse(component: TSceneComponent, impulse: vec3) {
    const sc: TPhysicsApplyCentralImpulse = {
      type: TPhysicsStateChangeType.APPLY_CENTRAL_IMPULSE,
      uuid: component.uuid,
      impulse,
    };
    this.queuePhysicsStateChange(sc);
  }

  /**
   * Adds a listener for when a collision occurs with a specific collision class
   *
   * @todo add support for removing listeners
   */
  public onEnterCollisionClass(
    actor: TActor,
    collisionClass: string,
    handler: TCollisionCallback,
  ) {
    if (!actor.rootComponent.collider) {
      throw new Error(
        'cannot add collision listener to actor without collider',
      );
    }

    if (!this.collisionListeners[actor.rootComponent.uuid]) {
      this.collisionListeners[actor.rootComponent.uuid] = [];
    }

    this.collisionListeners[actor.rootComponent.uuid].push({
      componentUUID: actor.rootComponent.uuid,
      collisionClass,
      handler,
    });
  }

  private queuePhysicsStateChange(stateChange: TPhysicsStateChange) {
    this.queuedStateChanges.push(stateChange);
  }

  public updateBodyOptions(
    component: TSceneComponent,
    options: TPhysicsBodyOptions,
  ) {
    // If there is no collider, it definitely won't be in the physics world
    if (!component.collider) return;

    // @todo check if this body is registered yet, if not, we can just wait until it's registered
    const sc: TPhysicsUpdateBodyOptions = {
      type: TPhysicsStateChangeType.UPDATE_BODY_OPTIONS,
      uuid: component.uuid,
      options,
    };
    this.queuePhysicsStateChange(sc);
  }

  public updateTransform(component: TSceneComponent) {
    // If there is no collider, it definitely won't be in the physics world
    if (!component.collider) return;

    const transform = component.getWorldTransform();

    const sc: TPhysicsUpdateTransform = {
      type: TPhysicsStateChangeType.UPDATE_TRANSFORM,
      uuid: component.uuid,
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
      const actor = this.actors.find(
        (actor) => actor.rootComponent.uuid === hit.uuid,
      );
      if (!actor) continue;

      result.push({
        distance: hit.distance,
        actor,
        // @todo this will need to be updated once root components are no longer used with the physics
        component: actor.rootComponent,
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
      const actor = this.actors.find(
        (actor) => actor.rootComponent.uuid === hit.uuid,
      );
      if (!actor) continue;

      result.push({
        actor,
        // @todo this will need to be updated once root components are no longer used with the physics
        component: actor.rootComponent,
      });
    }

    return result;
  }
}

export interface TWorldQueryLineResult {
  actor: TActor;
  component: TSceneComponent;
  distance: number;
}

export interface TWorldQueryAreaResult {
  actor: TActor;
  component: TSceneComponent;
}
