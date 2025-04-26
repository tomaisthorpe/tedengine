import type TWorld from './world';
import type TEngine from '../engine/engine';

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
    delta: number,
  ): Promise<void>;
}
