import type { TWorld } from './world';
import type { TEngine } from '../engine/engine';

export enum TSystemPriority {
  First = 0,
  PreUpdate = 10,
  Update = 20,
  PostUpdate = 30,
  Last = 40,
}
export abstract class TSystem {
  public readonly priority: number = TSystemPriority.Update;

  /**
   * The name of the system. This is used for debugging and segment timing.
   * Override this static property in subclasses to provide a meaningful name that won't be minified.
   */
  public static readonly systemName: string = 'TSystem';

  /**
   * The name of the system. This is used for debugging and segment timing.
   * Returns the static systemName property to avoid minification issues.
   */
  public get name(): string {
    return (this.constructor as typeof TSystem).systemName;
  }

  public abstract update(
    engine: TEngine,
    world: TWorld,
    delta: number,
  ): Promise<void>;
}
