import { TSystemPriority } from '../core/system';
import type TEngine from './engine';

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

  public abstract update(engine: TEngine, delta: number): Promise<void>;
}
