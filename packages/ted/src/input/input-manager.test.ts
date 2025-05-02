import { TInputManager, TInputDevice } from './input-manager';
import type { TInputKey } from './input-manager';
import TEventQueue from '../core/event-queue';
import { TEventTypesInput } from './events';
import type {
  TKeyDownEvent,
  TKeyUpEvent,
  TMouseDownEvent,
  TMouseMoveEvent,
  TMouseUpEvent,
  TPointerLockAcquired,
  TPointerLockReleased,
  TMouseLocation,
  TMouseMovement,
} from './events';
import type { vec2 } from 'gl-matrix';

describe('TInputManager', () => {
  let inputManager: TInputManager;
  let eventQueue: TEventQueue;

  beforeEach(() => {
    eventQueue = new TEventQueue();
    inputManager = new TInputManager(eventQueue);
  });

  describe('input mapping', () => {
    it('should map input actions to keys', () => {
      const key: TInputKey = { device: TInputDevice.Keyboard, key: 'Space' };
      inputManager.mapInput('jump', key);

      // Simulate key press
      eventQueue.broadcast({
        type: TEventTypesInput.KeyDown,
        subType: 'Space',
      } as TKeyDownEvent);

      eventQueue.update();
      inputManager.update(0.016);

      expect(inputManager.isActionActive('jump')).toBe(true);
    });

    it('should clear input mappings', () => {
      const key: TInputKey = { device: TInputDevice.Keyboard, key: 'Space' };
      inputManager.mapInput('jump', key);
      inputManager.clearMappings('jump');

      // Simulate key press
      eventQueue.broadcast({
        type: TEventTypesInput.KeyDown,
        subType: 'Space',
      } as TKeyDownEvent);

      eventQueue.update();
      inputManager.update(0.016);

      expect(inputManager.isActionActive('jump')).toBe(false);
    });

    it('should handle multiple keys for same action', () => {
      const key1: TInputKey = { device: TInputDevice.Keyboard, key: 'Space' };
      const key2: TInputKey = { device: TInputDevice.Keyboard, key: 'J' };

      inputManager.mapInput('jump', key1);
      inputManager.mapInput('jump', key2);

      // Simulate first key press
      eventQueue.broadcast({
        type: TEventTypesInput.KeyDown,
        subType: 'Space',
      } as TKeyDownEvent);

      eventQueue.update();
      inputManager.update(0.016);

      expect(inputManager.isActionActive('jump')).toBe(true);

      // Simulate first key release and second key press
      eventQueue.broadcast({
        type: TEventTypesInput.KeyUp,
        subType: 'Space',
      } as TKeyUpEvent);

      eventQueue.broadcast({
        type: TEventTypesInput.KeyDown,
        subType: 'J',
      } as TKeyDownEvent);

      eventQueue.update();
      inputManager.update(0.016);

      expect(inputManager.isActionActive('jump')).toBe(true);
    });
  });

  describe('input state', () => {
    it('should track key press state', () => {
      const key: TInputKey = { device: TInputDevice.Keyboard, key: 'Space' };
      inputManager.mapInput('jump', key);

      // Press key
      eventQueue.broadcast({
        type: TEventTypesInput.KeyDown,
        subType: 'Space',
      } as TKeyDownEvent);

      eventQueue.update();
      inputManager.update(0.016);

      expect(inputManager.isActionActive('jump')).toBe(true);
      expect(inputManager.wasActionJustPressed('jump')).toBe(true);

      // Update to clear justPressed
      eventQueue.update();
      inputManager.update(0.016);

      expect(inputManager.isActionActive('jump')).toBe(true);
      expect(inputManager.wasActionJustPressed('jump')).toBe(false);

      // Release key
      eventQueue.broadcast({
        type: TEventTypesInput.KeyUp,
        subType: 'Space',
      } as TKeyUpEvent);

      eventQueue.update();
      inputManager.update(0.016);

      expect(inputManager.isActionActive('jump')).toBe(false);
      expect(inputManager.wasActionJustReleased('jump')).toBe(true);
    });

    it('should track time pressed', () => {
      const key: TInputKey = { device: TInputDevice.Keyboard, key: 'Space' };
      inputManager.mapInput('jump', key);

      // Press key
      eventQueue.broadcast({
        type: TEventTypesInput.KeyDown,
        subType: 'Space',
      } as TKeyDownEvent);

      // Update multiple times
      eventQueue.update();
      inputManager.update(0.5);

      eventQueue.update();
      inputManager.update(0.5);

      eventQueue.update();
      inputManager.update(0.5);

      const state = inputManager.getActionState('jump');
      expect(state?.timePressed).toBe(1.0);
    });
  });

  describe('mouse input', () => {
    it('should track mouse location', () => {
      const client: vec2 = [100, 200];
      const screen: vec2 = [100, 200];
      const clip: vec2 = [0.5, 0.5];
      const movement: TMouseMovement = {
        client: [10, 20],
        clip: [0.1, 0.2],
      };

      eventQueue.broadcast({
        type: TEventTypesInput.MouseMove,
        client,
        screen,
        clip,
        movement,
      } as TMouseMoveEvent);

      eventQueue.update();
      inputManager.update(0.016);

      const location = inputManager.getMouseLocation();
      expect(location?.client[0]).toBe(100);
      expect(location?.client[1]).toBe(200);
    });

    it('should track mouse movement', () => {
      const client: vec2 = [100, 200];
      const screen: vec2 = [100, 200];
      const clip: vec2 = [0.5, 0.5];
      const movement: TMouseMovement = {
        client: [10, 20],
        clip: [0.1, 0.2],
      };

      eventQueue.broadcast({
        type: TEventTypesInput.MouseMove,
        client,
        screen,
        clip,
        movement,
      } as TMouseMoveEvent);

      eventQueue.update();
      inputManager.update(0.016);

      const movementResult = inputManager.getMouseMovement();
      expect(movementResult?.client[0]).toBe(10);
      expect(movementResult?.client[1]).toBe(20);
    });

    it('should handle mouse button states', () => {
      const key: TInputKey = { device: TInputDevice.Mouse, key: 'Left' };
      inputManager.mapInput('shoot', key);

      const location: TMouseLocation = {
        client: [0, 0],
        screen: [0, 0],
        clip: [0, 0],
      };

      // Press mouse button
      eventQueue.broadcast({
        type: TEventTypesInput.MouseDown,
        subType: 'Left',
        ...location,
      } as TMouseDownEvent);

      eventQueue.update();
      inputManager.update(0.016);

      expect(inputManager.isActionActive('shoot')).toBe(true);
      expect(inputManager.wasActionJustPressed('shoot')).toBe(true);

      // Release mouse button
      eventQueue.broadcast({
        type: TEventTypesInput.MouseUp,
        subType: 'Left',
        ...location,
      } as TMouseUpEvent);

      eventQueue.update();
      inputManager.update(0.016);

      expect(inputManager.isActionActive('shoot')).toBe(false);
      expect(inputManager.wasActionJustReleased('shoot')).toBe(true);
    });
  });

  describe('pointer lock', () => {
    it('should handle pointer lock acquisition', () => {
      inputManager.enablePointerLock();

      eventQueue.broadcast({
        type: TEventTypesInput.PointerLockAcquired,
      } as TPointerLockAcquired);

      eventQueue.update();
      inputManager.update(0.016);

      expect(inputManager.pointerLocked).toBe(true);
    });

    it('should handle pointer lock release', () => {
      inputManager.enablePointerLock();

      eventQueue.broadcast({
        type: TEventTypesInput.PointerLockAcquired,
      } as TPointerLockAcquired);

      eventQueue.update();
      inputManager.update(0.016);

      expect(inputManager.pointerLocked).toBe(true);

      eventQueue.broadcast({
        type: TEventTypesInput.PointerLockReleased,
      } as TPointerLockReleased);

      eventQueue.update();
      inputManager.update(0.016);

      expect(inputManager.pointerLocked).toBe(false);
    });
  });
});
