import { quat, vec3 } from 'gl-matrix';
import type TEngine from '../engine/engine';
import type { TPhysicsBody } from '../physics/physics-world';
import type { TSerializedRenderTask } from '../renderer/frame-params';
import type TActor from './actor';
import type {
  TPhysicsInMessageRegisterBody,
  TPhysicsInMessageSimulateStep,
  TPhysicsOutMessageSimulateDone,
  TPhysicsInMessageWorldSetup,
  TPhysicsInMessageApplyCentralForce,
  TPhysicsInMessageApplyCentralImpulse,
} from '../physics/messages';
import { TPhysicsMessageTypes } from '../physics/messages';
import type TSceneComponent from '../actor-components/scene-component';

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
  private config: TWorldConfig = {
    enableGravity: true,
    defaultCollisionClass: 'Solid',
    collisionClasses: [
      { name: 'Solid' },
      { name: 'NoCollide', ignores: ['Solid'] },
    ],
  };
  private workerPort?: MessagePort;

  private paused = false;

  private updateResolve?: (stats: TWorldUpdateStats) => void;
  private lastDelta = 0;
  private updateStartTime = 0;

  private onCreatedResolve?: () => void;

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
  }

  private registerActorWithPhysicsWorker(actor: TActor) {
    // Register only the root component
    const component = actor.rootComponent;

    if (!component.collider) return;

    const transform = component.getWorldTransform();

    const message: TPhysicsInMessageRegisterBody = {
      type: TPhysicsMessageTypes.REGISTER_BODY,
      uuid: component.uuid,
      collider: component.collider.getConfig(),
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
    };

    // @todo this shouldn't be optional
    this.workerPort?.postMessage(message);
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
        this.onPhysicsUpdate(message.bodies, message.stepElapsedTime);
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
      };

      // This will trigger a message that will eventually result in updateResolve being triggered
      this.workerPort?.postMessage(message);
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

  public onPhysicsUpdate(worldState: TPhysicsBody[], stepElapsedTime: number) {
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

  public destroy() {
    this.worker?.terminate();
  }

  public applyCentralForce(component: TSceneComponent, force: vec3) {
    const message: TPhysicsInMessageApplyCentralForce = {
      type: TPhysicsMessageTypes.APPLY_CENTRAL_FORCE,
      uuid: component.uuid,
      force,
    };

    this.workerPort?.postMessage(message);
  }

  public applyCentralImpulse(component: TSceneComponent, impulse: vec3) {
    const message: TPhysicsInMessageApplyCentralImpulse = {
      type: TPhysicsMessageTypes.APPLY_CENTRAL_IMPULSE,
      uuid: component.uuid,
      impulse,
    };

    this.workerPort?.postMessage(message);
  }
}
