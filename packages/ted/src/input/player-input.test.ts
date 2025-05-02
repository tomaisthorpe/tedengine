import {
  TPlayerInputComponent,
  TPlayerInputSystem,
  TPlayerInputAction,
  setPlayerInputMapping,
} from './player-input';
import { TInputManager } from './input-manager';
import TEventQueue from '../core/event-queue';
import { TEventTypesInput } from './events';
import type { TKeyDownEvent, TKeyUpEvent } from './events';
import type TWorld from '../core/world';
import type TEngine from '../engine/engine';
import { vec2 } from 'gl-matrix';

describe('TPlayerInputComponent', () => {
  let component: TPlayerInputComponent;

  beforeEach(() => {
    component = new TPlayerInputComponent();
  });

  it('should initialize with zero move direction', () => {
    expect(component.moveDirection).toEqual(vec2.fromValues(0, 0));
    expect(component.previousState.moveDirection).toEqual(
      vec2.fromValues(0, 0),
    );
  });

  it('should update previous state correctly', () => {
    component.moveDirection = vec2.fromValues(1, 1);
    component.updatePreviousState();
    expect(component.previousState.moveDirection).toEqual(
      vec2.fromValues(1, 1),
    );
  });
});

describe('TPlayerInputSystem', () => {
  let system: TPlayerInputSystem;
  let inputManager: TInputManager;
  let eventQueue: TEventQueue;
  let mockWorld: TWorld;
  let mockEngine: TEngine;

  beforeEach(() => {
    eventQueue = new TEventQueue();
    inputManager = new TInputManager(eventQueue);
    mockWorld = {
      createQuery: jest.fn().mockReturnValue({
        execute: jest.fn().mockReturnValue([]),
      }),
      getComponents: jest.fn(),
    } as unknown as TWorld;
    mockEngine = {} as TEngine;
    system = new TPlayerInputSystem(mockWorld, inputManager);
  });

  it('should calculate movement direction correctly', async () => {
    // Create a mock entity with player input component
    const component = new TPlayerInputComponent();
    const entity = 1;
    (mockWorld.getComponents as jest.Mock).mockReturnValue(
      new Map([[TPlayerInputComponent, component]]),
    );
    (mockWorld.createQuery().execute as jest.Mock).mockReturnValue([entity]);

    setPlayerInputMapping(inputManager);

    // Press W key (move forward)
    eventQueue.broadcast({
      type: TEventTypesInput.KeyDown,
      subType: 'w',
    } as TKeyDownEvent);

    eventQueue.update();
    inputManager.update(0.016);

    await system.update(mockEngine, mockWorld, 0.016);

    expect(component.moveDirection).toEqual(vec2.fromValues(0, 1));

    // Press A key (move left)
    eventQueue.broadcast({
      type: TEventTypesInput.KeyDown,
      subType: 'a',
    } as TKeyDownEvent);

    eventQueue.update();
    inputManager.update(0.016);

    await system.update(mockEngine, mockWorld, 0.016);
    expect(component.moveDirection).toEqual(vec2.fromValues(-1, 1));

    // Release W key
    eventQueue.broadcast({
      type: TEventTypesInput.KeyUp,
      subType: 'w',
    } as TKeyUpEvent);

    eventQueue.update();
    inputManager.update(0.016);

    await system.update(mockEngine, mockWorld, 0.016);
    expect(component.moveDirection).toEqual(vec2.fromValues(-1, 0));
  });

  it('should handle multiple keys for same action', async () => {
    const component = new TPlayerInputComponent();
    const entity = 1;
    (mockWorld.getComponents as jest.Mock).mockReturnValue(
      new Map([[TPlayerInputComponent, component]]),
    );
    (mockWorld.createQuery().execute as jest.Mock).mockReturnValue([entity]);

    setPlayerInputMapping(inputManager);

    // Press W key (move forward)
    eventQueue.broadcast({
      type: TEventTypesInput.KeyDown,
      subType: 'w',
    } as TKeyDownEvent);

    eventQueue.update();
    inputManager.update(0.016);

    await system.update(mockEngine, mockWorld, 0.016);
    expect(component.moveDirection).toEqual(vec2.fromValues(0, 1));

    // Press Up Arrow (also move forward)
    eventQueue.broadcast({
      type: TEventTypesInput.KeyDown,
      subType: 'ArrowUp',
    } as TKeyDownEvent);

    // Release W key
    eventQueue.broadcast({
      type: TEventTypesInput.KeyUp,
      subType: 'w',
    } as TKeyUpEvent);

    eventQueue.update();
    inputManager.update(0.016);

    await system.update(mockEngine, mockWorld, 0.016);
    expect(component.moveDirection).toEqual(vec2.fromValues(0, 1)); // Still moving forward due to Up Arrow
  });
});

describe('setPlayerInputMapping', () => {
  let inputManager: TInputManager;
  let eventQueue: TEventQueue;

  beforeEach(() => {
    eventQueue = new TEventQueue();
    inputManager = new TInputManager(eventQueue);
    setPlayerInputMapping(inputManager);
  });

  it('should map WASD keys correctly', () => {
    expect(inputManager.isActionActive(TPlayerInputAction.MoveForward)).toBe(
      false,
    );
    expect(inputManager.isActionActive(TPlayerInputAction.MoveBackward)).toBe(
      false,
    );
    expect(inputManager.isActionActive(TPlayerInputAction.MoveLeft)).toBe(
      false,
    );
    expect(inputManager.isActionActive(TPlayerInputAction.MoveRight)).toBe(
      false,
    );

    // Press W
    eventQueue.broadcast({
      type: TEventTypesInput.KeyDown,
      subType: 'w',
    } as TKeyDownEvent);

    eventQueue.update();
    inputManager.update(0.016);

    expect(inputManager.isActionActive(TPlayerInputAction.MoveForward)).toBe(
      true,
    );
  });

  it('should map arrow keys correctly', () => {
    expect(inputManager.isActionActive(TPlayerInputAction.MoveForward)).toBe(
      false,
    );
    expect(inputManager.isActionActive(TPlayerInputAction.MoveBackward)).toBe(
      false,
    );
    expect(inputManager.isActionActive(TPlayerInputAction.MoveLeft)).toBe(
      false,
    );
    expect(inputManager.isActionActive(TPlayerInputAction.MoveRight)).toBe(
      false,
    );

    // Press Up Arrow
    eventQueue.broadcast({
      type: TEventTypesInput.KeyDown,
      subType: 'ArrowUp',
    } as TKeyDownEvent);

    eventQueue.update();
    inputManager.update(0.016);

    expect(inputManager.isActionActive(TPlayerInputAction.MoveForward)).toBe(
      true,
    );
  });
});
