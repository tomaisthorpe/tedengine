import type { vec3 } from 'gl-matrix';
import type TSceneComponent from '../actor-components/scene-component';
import type TActor from '../core/actor';
import type TLevel from '../core/level';
import type {
  TPhysicsInMessageRegisterBody,
  TPhysicsInMessageSimulateStep,
  TPhysicsOutMessageSimulateDone,
  TPhysicsInMessageWorldSetup,
  TPhysicsInMessageApplyCentralForce,
  TPhysicsInMessageApplyCentralImpulse,
} from './worker/messages';
import { TPhysicsMessageTypes } from './worker/messages';

export interface TWorldConfig {
  enableGravity: boolean;
  defaultCollisionClass: string;
  collisionClasses: TCollisionClass[];
}

export interface TCollisionClass {
  name: string;
  ignores?: [string];
}

export default class TWorld {
  private worker?: Worker;
  private config?: TWorldConfig;

  constructor(private level: TLevel) {}

  private onCreatedResolve?: () => void;

  public create(config: TWorldConfig): Promise<void> {
    return new Promise<void>((resolve) => {
      this.config = config;
      this.onCreatedResolve = resolve;
      this.worker = new Worker(new URL('./worker/worker.ts', import.meta.url));
      this.worker.onmessage = this.onMessage.bind(this);
    });
  }

  public step(delta: number) {
    const message: TPhysicsInMessageSimulateStep = {
      type: TPhysicsMessageTypes.SIMULATE_STEP,
      delta,
    };

    this.worker?.postMessage(message);
  }

  public registerActor(actor: TActor) {
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
    this.worker?.postMessage(message);
  }

  public applyCentralForce(component: TSceneComponent, force: vec3) {
    const message: TPhysicsInMessageApplyCentralForce = {
      type: TPhysicsMessageTypes.APPLY_CENTRAL_FORCE,
      uuid: component.uuid,
      force,
    };

    this.worker?.postMessage(message);
  }

  public applyCentralImpulse(component: TSceneComponent, impulse: vec3) {
    const message: TPhysicsInMessageApplyCentralImpulse = {
      type: TPhysicsMessageTypes.APPLY_CENTRAL_IMPULSE,
      uuid: component.uuid,
      impulse,
    };

    this.worker?.postMessage(message);
  }

  private onMessage(event: MessageEvent) {
    if (event.data.type !== TPhysicsMessageTypes.SIMULATE_DONE) {
      console.log('game world received', event.data);
    }

    const { data } = event;
    switch (data.type) {
      case TPhysicsMessageTypes.INIT:
        this.setupWorld();
        break;
      case TPhysicsMessageTypes.WORLD_CREATED:
        if (this.onCreatedResolve) {
          this.onCreatedResolve();
        }
        break;
      case TPhysicsMessageTypes.SIMULATE_DONE: {
        const message = data as TPhysicsOutMessageSimulateDone;
        this.level.onPhysicsUpdate(message.bodies);
        break;
      }
    }
  }

  private setupWorld() {
    if (!this.config) {
      throw new Error('config not set');
    }

    const message: TPhysicsInMessageWorldSetup = {
      type: TPhysicsMessageTypes.WORLD_SETUP,
      config: this.config,
    };

    this.worker?.postMessage(message);
  }

  public destroy() {
    this.worker?.terminate();
  }
}
