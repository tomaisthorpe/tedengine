import type { vec2 } from 'gl-matrix';

export enum TEventTypesInput {
  KeyUp = 'keyup',
  KeyDown = 'keydown',
  MouseUp = 'mouseup',
  MouseDown = 'mousedown',
  MouseMove = 'mousemove',
  TouchStart = 'touchstart',
  TouchEnd = 'touchend',
  TouchMove = 'touchmove',
  TouchCancel = 'touchcancel',
  ActionPressed = 'controller_actionpressed',
  ActionReleased = 'controller_actionreleased',
  PointerLockRequest = 'pointerlockrequest',
  PointerLockAcquired = 'pointerlockacquired',
  PointerLockReleased = 'pointerlockreleased',
}

export interface TKeyUpEvent {
  type: TEventTypesInput.KeyUp;
  subType: string; // Key released
}

export interface TKeyDownEvent {
  type: TEventTypesInput.KeyDown;
  subType: string; // Key pressed
}

export interface TMouseLocation {
  client: vec2;
  screen: vec2;
  clip: vec2;
}

export interface TMouseMovement {
  client: vec2;
  clip: vec2;
}

export interface TMouseUpEvent extends TMouseLocation {
  type: TEventTypesInput.MouseUp;
  subType: string; // Button released
}

export interface TMouseDownEvent extends TMouseLocation {
  type: TEventTypesInput.MouseDown;
  subType: string; // Button pressed
}

export interface TMouseMoveEvent extends TMouseLocation {
  type: TEventTypesInput.MouseMove;
  movement: TMouseMovement;
}

export interface TTouchStartEvent extends TMouseLocation {
  type: TEventTypesInput.TouchStart;
}

export interface TTouchEndEvent extends TMouseLocation {
  type: TEventTypesInput.TouchEnd;
}

export interface TTouchMoveEvent extends TMouseLocation {
  type: TEventTypesInput.TouchMove;
  movement: TMouseMovement;
}

export interface TTouchCancelEvent extends TMouseLocation {
  type: TEventTypesInput.TouchCancel;
}

export interface TActionPressedEvent {
  type: TEventTypesInput.ActionPressed;
  subType: string; // Action pressed
}

export interface TActionReleasedEvent {
  type: TEventTypesInput.ActionReleased;
  subType: string; // Action released
}

export interface TPointerLockRequest {
  type: TEventTypesInput.PointerLockRequest;
}

export interface TPointerLockAcquired {
  type: TEventTypesInput.PointerLockAcquired;
}

export interface TPointerLockReleased {
  type: TEventTypesInput.PointerLockReleased;
}
