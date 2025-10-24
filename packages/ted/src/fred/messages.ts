export enum TFredMessageTypes {
  READY = 'fred_ready',
  SHUTDOWN = 'fred_shutdown',
  STATS = 'fred_stats',
}

export interface TFredMessageReady {
  type: TFredMessageTypes.READY;
}

export interface TFredMessageShutdown {
  type: TFredMessageTypes.SHUTDOWN;
}

export interface TFredMessageStats {
  type: TFredMessageTypes.STATS;
  render: {
    total: number;
  };
}
