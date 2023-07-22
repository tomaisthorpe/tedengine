import { v4 as uuidv4 } from 'uuid';
import type TActorComponent from '../actor-components/actor-component';
import TSceneComponent from '../actor-components/scene-component';
import type TEngine from '../engine/engine';
import type { TSerializedRenderTask } from '../renderer/frame-params';
import type TLevel from './level';

export interface TActorWithOnUpdate extends TActor {
  onUpdate(engine: TEngine, delta: number): Promise<void>;
}

const hasOnUpdate = (state: TActor): state is TActorWithOnUpdate =>
  (state as TActorWithOnUpdate).onUpdate !== undefined;

export default class TActor {
  public uuid: string = uuidv4();
  public level?: TLevel;

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
}
