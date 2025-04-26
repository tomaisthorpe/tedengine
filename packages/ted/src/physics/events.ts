import type { TEntity } from '../core/world';

export enum TEventTypesPhysics {
  COLLISION_START = 'collision_start',
}

export interface TCollisionStartEvent {
  type: TEventTypesPhysics.COLLISION_START;
  subType: string; // Collision class of entityB
  payload: {
    entityA: TEntity;
    entityB: TEntity;
  };
}
