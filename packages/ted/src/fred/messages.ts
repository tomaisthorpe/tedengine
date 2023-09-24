export enum TFredMessageTypes {
  READY = 'fred_ready',
  SHUTDOWN = 'fred_shutdown',
}

export interface TFredMessageReady {
  type: TFredMessageTypes.READY;
}

export interface TFredMessageShutdown {
  type: TFredMessageTypes.SHUTDOWN;
}
