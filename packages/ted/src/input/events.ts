export enum TEventTypesInput {
  KeyUp = 'keyup',
  KeyDown = 'keydown',
  MouseUp = 'mouseup',
  MouseDown = 'mousedown',
  MouseMove = 'mousemove',
  ActionPressed = 'controller_actionpressed',
  ActionReleased = 'controller_actionreleased',
}

export interface TKeyUpEvent {
  type: TEventTypesInput.KeyUp;
  subType: string; // Key released
}

export interface TKeyDownEvent {
  type: TEventTypesInput.KeyDown;
  subType: string; // Key pressed
}

export interface TMouseUpEvent {
  type: TEventTypesInput.MouseUp;
  subType: string; // Button released
}

export interface TMouseDownEvent {
  type: TEventTypesInput.MouseDown;
  subType: string; // Button pressed
}

export interface TMouseMoveEvent {
  type: TEventTypesInput.MouseMove;
  clientX: number;
  clientY: number;
  x: number;
  y: number;
}

export interface TActionPressedEvent {
  type: TEventTypesInput.ActionPressed;
  subType: string; // Action pressed
}

export interface TActionReleasedEvent {
  type: TEventTypesInput.ActionReleased;
  subType: string; // Action released
}
