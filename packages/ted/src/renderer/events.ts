export enum TEventTypesRenderer {
  RenderingSizeChanged = 'renderer_renderingsizechanged',
}

export interface TRenderingSizeChangedEvent {
  type: TEventTypesRenderer.RenderingSizeChanged;
  width: number;
  height: number;
}
