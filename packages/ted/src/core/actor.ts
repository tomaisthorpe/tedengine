import { v4 as uuidv4 } from 'uuid';
import type TActorComponent from '../actor-components/actor-component';
import TSceneComponent from '../actor-components/scene-component';
import type TEngine from '../engine/engine';
import type { TSerializedRenderTask } from '../renderer/frame-params';
import type TWorld from './world';
import type { TCollisionCallback } from './world';

export interface TActorWithOnUpdate extends TActor {
  onUpdate(engine: TEngine, delta: number): Promise<void>;
}

export interface TActorWithOnDestroy extends TActor {
  onDestroy(): void;
}

const hasOnUpdate = (state: TActor): state is TActorWithOnUpdate =>
  (state as TActorWithOnUpdate).onUpdate !== undefined;

const hasOnDestroy = (state: TActor): state is TActorWithOnDestroy =>
  (state as TActorWithOnDestroy).onDestroy !== undefined;

export interface TActorWithOnWorldAdd extends TActor {
  onWorldAdd(engine: TEngine, world: TWorld): void;
}

export default class TActor {
  public uuid: string = uuidv4();
  public world?: TWorld;

  public dead = false;

  /**
   * List of components that belong to this actor
   */
  public components: TActorComponent[] = [];

  /**
   * Root component for the actor
   */
  public rootComponent: TSceneComponent = new TSceneComponent(this);

  /**
   * Runs update process on each component
   *
   * **DO NOT OVERRIDE!** Add [[`onUpdate`]] instead.
   * @hidden
   */
  public update(engine: TEngine, delta: number): void {
    if (this.dead) return;

    for (const component of this.components) {
      component.update(engine, delta);
    }

    if (hasOnUpdate(this)) {
      this.onUpdate(engine, delta);
    }
  }

  public getRenderTasks(): TSerializedRenderTask[] {
    // const sprites: TSpriteComponent[] = [];
    const tasks: TSerializedRenderTask[] = [];

    for (const component of this.components) {
      // if (component instanceof TSpriteComponent) {
      //   if (component.shouldRender) {
      //     sprites.push(component);
      //   }
      //   continue;
      // }

      if (component instanceof TSceneComponent) {
        if (component.shouldRender) {
          const task = component.getRenderTask();
          if (task) {
            tasks.push(task);
          }
        }
      }
    }

    return tasks;
  }

  public onEnterCollisionClass(
    className: string,
    callback: TCollisionCallback,
  ) {
    if (!this.world) {
      throw new Error('world not initialised');
    }

    this.world.onEnterCollisionClass(this, className, callback);
  }

  public destroy() {
    if (this.dead) {
      return;
    }

    this.dead = true;

    if (hasOnDestroy(this)) {
      this.onDestroy();
    }

    if (this.world) {
      this.world.removeActor(this);
    }

    // @todo clean up the components
  }
}
