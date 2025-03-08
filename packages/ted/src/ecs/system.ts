import type TWorld from '../core/world';
import type TEngine from '../engine/engine';
import type { TECS } from './ecs';

export abstract class TSystem {
  public abstract update(
    engine: TEngine,
    world: TWorld,
    ecs: TECS,
    delta: number,
  ): Promise<void>;
}
