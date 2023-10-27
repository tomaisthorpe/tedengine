import { quat, vec3 } from 'gl-matrix';
import type TEngine from '../engine/engine';
import type {
  TPhysicsBody,
  TPhysicsBodyOptions,
  TPhysicsCollision,
} from '../physics/physics-world';
import type { TSerializedRenderTask } from '../renderer/frame-params';
import type TActor from './actor';
import type {
  TPhysicsInMessageSimulateStep,
  TPhysicsOutMessageSimulateDone,
  TPhysicsInMessageWorldSetup,
  TPhysicsRegisterBody,
} from '../physics/messages';
import { TPhysicsMessageTypes } from '../physics/messages';
import type TSceneComponent from '../actor-components/scene-component';
import type { TActorWithOnWorldAdd } from './actor';
import type {
  TPhysicsApplyCentralForce,
  TPhysicsStateChange,
  TPhysicsApplyCentralImpulse,
  TPhysicsUpdateBodyOptions,
  TPhysicsUpdateTransform,
} from '../physics/state-changes';
import { TPhysicsStateChangeType } from '../physics/state-changes';

const actorHasOnWorldAdd = (state: TActor): state is TActorWithOnWorldAdd =>
  (state as TActorWithOnWorldAdd).onWorldAdd !== undefined;

export type TCollisionCallback = (actor: TActor) => void;

export interface TCollisionListener {
  componentUUID: string;
  collisionClass?: string;
  handler: TCollisionCallback;
}

export interface TWorldConfig {
  enableGravity: boolean;
  defaultCollisionClass: string;
  collisionClasses: TCollisionClass[];
}

export interface TCollisionClass {
  name: string;
  ignores?: [string];
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
    enableGravity: true,
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

  private updateResolve?: (stats: TWorldUpdateStats) => void;
  private lastDelta = 0;
  private updateStartTime = 0;

  private onCreatedResolve?: () => void;

  private collisionListeners: { [key: string]: TCollisionListener } = {};

  constructor(private engine: TEngine) {}

  public async create(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.onCreatedResolve = resolve;
      this.worker = new Worker(
        new URL('../physics/worker.ts', import.meta.url)
      );
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
      mass: component.mass,
      options: component.bodyOptions,
    });

    this.collisionClassLookup[component.uuid] =
      colliderConfig.collisionClass || this.config.defaultCollisionClass;
  }

  private onMessage(event: MessageEvent) {
    if (event.data.type !== TPhysicsMessageTypes.SIMULATE_DONE) {
      console.log('game world received', event.data);
    }

    const { data } = event;
    switch (data.type) {
      case TPhysicsMessageTypes.INIT:
        this.workerPort = event.ports[0];
        this.workerPort.onmessage = this.onMessage.bind(this);
        this.setupWorld();
        break;
      case TPhysicsMessageTypes.WORLD_CREATED:
        if (this.onCreatedResolve) {
          this.onCreatedResolve();
        }
        break;
      case TPhysicsMessageTypes.SIMULATE_DONE: {
        const message = data as TPhysicsOutMessageSimulateDone;
        this.onPhysicsUpdate(
          message.bodies,
          message.collisions,
          message.stepElapsedTime
        );
        break;
      }
    }
  }

  /**
   * Sends the world config once the worker has been created
   */
  private setupWorld() {
    if (!this.config) {
      throw new Error('config not set');
    }

    const message: TPhysicsInMessageWorldSetup = {
      type: TPhysicsMessageTypes.WORLD_SETUP,
      config: this.config,
    };

    this.workerPort?.postMessage(message);
  }

  /**
   * Called every frame with delta and triggers update on all actors
   */
  public update(engine: TEngine, delta: number): Promise<TWorldUpdateStats> {
    return new Promise((resolve) => {
      if (this.paused) {
        resolve({
          worldUpdateTime: 0,
          physicsStepTime: 0,
          physicsTotalTime: 0,
          actorUpdateTime: 0,
        });
      }

      this.updateStartTime = performance.now();

      this.lastDelta = delta;
      this.updateResolve = resolve;

      const message: TPhysicsInMessageSimulateStep = {
        type: TPhysicsMessageTypes.SIMULATE_STEP,
        delta,
        newBodies: this.queuedNewBodies,
        stateChanges: this.queuedStateChanges,
      };

      // This will trigger a message that will eventually result in updateResolve being triggered
      this.workerPort?.postMessage(message);

      this.queuedNewBodies = [];
      this.queuedStateChanges = [];
    });
  }

  public getRenderTasks(): TSerializedRenderTask[] {
    const tasks: TSerializedRenderTask[] = [];

    for (const actor of this.actors) {
      tasks.push(...actor.getRenderTasks());
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
    stepElapsedTime: number
  ) {
    for (const obj of worldState) {
      // Find the actor with root component with this uuid
      for (const actor of this.actors) {
        if (actor.rootComponent.uuid === obj.uuid) {
          actor.rootComponent.transform.translation = vec3.fromValues(
            ...obj.translation
          );
          actor.rootComponent.transform.rotation = quat.fromValues(
            ...obj.rotation
          );

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

    this.updateResolve?.(stats);
  }

  private checkCollision(bodyA: string, bodyB: string) {
    const listener = this.collisionListeners[bodyA];
    if (!listener) return;

    // Just incase wasn't supplied
    if (!listener.collisionClass) return;

    // Check if the collision class matches what the listener is looking for
    if (this.collisionClassLookup[bodyB] !== listener.collisionClass) {
      return;
    }

    const actor = this.actors.find(
      (actor) => actor.rootComponent.uuid === bodyB
    );

    if (actor) {
      listener.handler(actor);
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

  public onEnterCollisionClass(
    actor: TActor,
    collisionClass: string,
    handler: TCollisionCallback
  ) {
    this.collisionListeners[actor.rootComponent.uuid] = {
      componentUUID: actor.rootComponent.uuid,
      collisionClass,
      handler,
    };
  }

  private queuePhysicsStateChange(stateChange: TPhysicsStateChange) {
    this.queuedStateChanges.push(stateChange);
  }

  public updateBodyOptions(
    component: TSceneComponent,
    options: TPhysicsBodyOptions
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
}
