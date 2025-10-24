import { TSystemPriority } from '../core/system';
import type { TEngine } from './engine';

/**
 * Base class for all engine systems.
 *
 * Engine systems are used to update the engine and the game state.
 * They should be used when you need a system that persists across game states.
 *
 * @abstract
 * @class TEngineSystem
 * @extends {TSystem}
 */
export abstract class TEngineSystem {
  /**
   * The priority of the system.
   *
   * Systems with a lower priority will be updated first.
   */
  public readonly priority: number = TSystemPriority.Update;

  /**
   * The name of the system. This is used for debugging and segment timing.
   * Override this static property in subclasses to provide a meaningful name that won't be minified.
   */
  public static readonly systemName: string = 'TEngineSystem';

  /**
   * The name of the system. This is used for debugging and segment timing.
   * Returns the static systemName property to avoid minification issues.
   */
  public get name(): string {
    return (this.constructor as typeof TEngineSystem).systemName;
  }

  public abstract update(engine: TEngine, delta: number): Promise<void>;
}
