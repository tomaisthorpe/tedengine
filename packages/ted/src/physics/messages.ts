export enum TPhysicsMessageTypes {
  INIT = 'init',
}

export interface TPhysicsOutMessageInit {
  type: TPhysicsMessageTypes.INIT;
}
