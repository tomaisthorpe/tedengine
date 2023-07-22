import type { TFrameParams } from '../renderer/frame-params';
import type { TGameContextData, TEngineContextData } from '../ui/context';

export enum TMessageTypesEngine {
  BOOTSTRAP = 'bootstrap',
  FRAME_READY = 'frame_ready',
  UPDATE_GAME_CONTEXT = 'update_game_context',
  UPDATE_ENGINE_CONTEXT = 'update_engine_context',
}

export interface TEngineMessageBootstrap {
  type: TMessageTypesEngine.BOOTSTRAP;
}

// @todo should this go through the event queue?
export interface TEngineMessageFrameReady {
  type: TMessageTypesEngine.FRAME_READY;
  params: TFrameParams;
}

export interface TEngineMessageUpdateGameContext {
  type: TMessageTypesEngine.UPDATE_GAME_CONTEXT;
  data: TGameContextData;
}

export interface TEngineMessageUpdateEngineContext {
  type: TMessageTypesEngine.UPDATE_ENGINE_CONTEXT;
  data: TEngineContextData;
}
