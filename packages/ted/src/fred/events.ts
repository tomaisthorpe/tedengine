export enum TEventTypesWindow {
  Blur = 'window_blur',
  Focus = 'window_focus',
}

/**
 * Triggered when the window loses focus
 */
export interface TWindowBlurEvent {
  type: TEventTypesWindow.Blur;
}

/**
 * Triggered when the window gains focus
 */
export interface TWindowFocusEvent {
  type: TEventTypesWindow.Focus;
}
