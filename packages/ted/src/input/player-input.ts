import { vec2 } from 'gl-matrix';
import { TComponent } from '../ecs/component';
import { TInputDevice, type TInputManager } from './input-manager';
import type { TECS } from '../ecs/ecs';
import type TECSQuery from '../ecs/query';
import { TSystem } from '../ecs/system';
import type TWorld from '../core/world';
import type TEngine from '../engine/engine';

export enum TPlayerInputAction {
  MoveForward = 'MoveForward',
  MoveBackward = 'MoveBackward',
  MoveLeft = 'MoveLeft',
  MoveRight = 'MoveRight',
}
export class TPlayerInputComponent extends TComponent {
  public moveDirection: vec2 = vec2.create();

  public previousState: {
    moveDirection: vec2;
  } = {
    moveDirection: vec2.create(),
  };

  public updatePreviousState() {
    this.previousState.moveDirection = vec2.clone(this.moveDirection);
  }
}

export class TPlayerInputSystem extends TSystem {
  private query: TECSQuery;
  constructor(
    private ecs: TECS,
    private inputManager: TInputManager,
  ) {
    super();
    this.query = this.ecs.createQuery([TPlayerInputComponent]);
  }

  public async update(
    engine: TEngine,
    world: TWorld,
    ecs: TECS,
    delta: number,
  ): Promise<void> {
    const entities = this.query.execute();

    for (const entity of entities) {
      const playerInputComponent = ecs
        .getComponents(entity)
        ?.get(TPlayerInputComponent);
      if (!playerInputComponent) continue;

      // Store in previous state to detect changes
      playerInputComponent.updatePreviousState();

      const horizontal =
        (this.inputManager.isActionActive(TPlayerInputAction.MoveRight)
          ? 1
          : 0) -
        (this.inputManager.isActionActive(TPlayerInputAction.MoveLeft) ? 1 : 0);
      const vertical =
        (this.inputManager.isActionActive(TPlayerInputAction.MoveForward)
          ? 1
          : 0) -
        (this.inputManager.isActionActive(TPlayerInputAction.MoveBackward)
          ? 1
          : 0);

      playerInputComponent.moveDirection = vec2.fromValues(
        horizontal,
        vertical,
      );
    }
  }
}

export function setPlayerInputMapping(inputManager: TInputManager) {
  inputManager.mapInput(TPlayerInputAction.MoveForward, {
    device: TInputDevice.Keyboard,
    key: 'w',
  });
  inputManager.mapInput(TPlayerInputAction.MoveBackward, {
    device: TInputDevice.Keyboard,
    key: 's',
  });
  inputManager.mapInput(TPlayerInputAction.MoveLeft, {
    device: TInputDevice.Keyboard,
    key: 'a',
  });
  inputManager.mapInput(TPlayerInputAction.MoveRight, {
    device: TInputDevice.Keyboard,
    key: 'd',
  });

  inputManager.mapInput(TPlayerInputAction.MoveForward, {
    device: TInputDevice.Keyboard,
    key: 'ArrowUp',
  });
  inputManager.mapInput(TPlayerInputAction.MoveBackward, {
    device: TInputDevice.Keyboard,
    key: 'ArrowDown',
  });
  inputManager.mapInput(TPlayerInputAction.MoveLeft, {
    device: TInputDevice.Keyboard,
    key: 'ArrowLeft',
  });
  inputManager.mapInput(TPlayerInputAction.MoveRight, {
    device: TInputDevice.Keyboard,
    key: 'ArrowRight',
  });
}
