export enum TFredMessageTypes {
  READY = 'fred_ready',
}

export interface TFredMessageRead {
  type: TFredMessageTypes.READY;
}
