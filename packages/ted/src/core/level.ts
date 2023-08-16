import { quat, vec3 } from 'gl-matrix';
import type TEngine from '../engine/engine';
import type { TPhysicsBody } from '../physics/worker/physics-world';
import TWorld from '../physics/world';
import type { TSerializedRenderTask } from '../renderer/frame-params';
import type TActor from './actor';

export default class TLevel {
  public actors: TActor[] = [];
  public world?: TWorld;

  private paused = false;

  private updateResolve?: () => void;
  private lastDelta = 0;

  constructor(private engine: TEngine) {}

  public async load(): Promise<void> {
    this.world = new TWorld(this);
    await this.world.create({
      enableGravity: true,
    });
  }

  /**
   * Adds actor to the level
   *
   * @param actor
   */
  public addActor(actor: TActor): void {
    actor.level = this;
    this.actors.push(actor);

    this.world?.registerActor(actor);
  }

  /**
   * Called every frame with delta and triggers update on all actors
   */
  public update(engine: TEngine, delta: number): Promise<void> {
    return new Promise((resolve) => {
      if (this.paused) {
        resolve();
      }

      this.lastDelta = delta;
      this.updateResolve = resolve;

      this.world?.step(delta);
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
   * Called when a state is entered so the level updates should continue
   */
  public start() {
    this.paused = false;
  }

  /**
   * Called when a state is moved out of the active state so level updates should stop
   */
  public pause() {
    this.paused = true;
  }

  public onPhysicsUpdate(worldState: TPhysicsBody[]) {
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

    for (const actor of this.actors) {
      actor.update(this.engine, this.lastDelta);
    }

    this.updateResolve?.();
  }

  public destroy() {
    this.world?.destroy();
  }
}
