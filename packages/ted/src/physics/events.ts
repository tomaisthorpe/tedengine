export enum TEventTypesPhysics {
  Collision = 'collision',
}

export interface TCollisionEvent {
  type: TEventTypesPhysics.Collision;
  subType: string; // collider uuid?
}
