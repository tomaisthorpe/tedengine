import type { TInputManager } from './input-manager';
import type { TECS } from '../ecs/ecs';
import { TSystem, TSystemPriority } from '../ecs/system';
import type TWorld from '../core/world';
import { TComponent } from '../ecs/component';
import type TECSQuery from '../ecs/query';
import type TEngine from '../engine/engine';
import type { TMouseLocation, TMouseMovement } from './events';

export class TMouseInputComponent extends TComponent {
  public mouseLocation?: TMouseLocation;
  public mouseMovement?: TMouseMovement;

  public previousState: {
    mouseLocation?: TMouseLocation;
    mouseMovement?: TMouseMovement;
  } = {
    mouseLocation: undefined,
    mouseMovement: undefined,
  };

  public updatePreviousState() {
    this.previousState.mouseLocation = this.mouseLocation;
    this.previousState.mouseMovement = this.mouseMovement;
  }
}

export class TMouseInputSystem extends TSystem {
  public readonly priority: number = TSystemPriority.PreUpdate;
  
  private query: TECSQuery;
  constructor(
    private ecs: TECS,
    private inputManager: TInputManager,
  ) {
    super();
    this.query = this.ecs.createQuery([TMouseInputComponent]);
  }

  public async update(
    engine: TEngine,
    world: TWorld,
    ecs: TECS,
    delta: number,
  ): Promise<void> {
    const entities = this.query.execute();

    for (const entity of entities) {
      const mouseInputComponent = ecs
        .getComponents(entity)
        ?.get(TMouseInputComponent);
      if (!mouseInputComponent) continue;

      mouseInputComponent.updatePreviousState();

      const mouseLocation = this.inputManager.getMouseLocation();
      const mouseMovement = this.inputManager.getMouseMovement();

      mouseInputComponent.mouseLocation = mouseLocation;
      mouseInputComponent.mouseMovement = mouseMovement;
    }
  }
}
