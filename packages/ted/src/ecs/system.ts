import type TWorld from '../core/world';
import type TEngine from '../engine/engine';
import type { TECS } from './ecs';

export enum TSystemPriority {
  First = 0,
  PreUpdate = 10,
  Update = 20,
  PostUpdate = 30,
  Last = 40,
}
export abstract class TSystem {
  public readonly priority: number = TSystemPriority.Update;
  public abstract update(
    engine: TEngine,
    world: TWorld,
    ecs: TECS,
    delta: number,
  ): Promise<void>;
}