import type { TInputManager } from './input-manager';
import { TSystem, TSystemPriority } from '../core/system';
import type { TWorld } from '../core/world';
import { TComponent } from '../core/component';
import type { TEntityQuery } from '../core/entity-query';
import type { TEngine } from '../engine/engine';
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
  public static readonly systemName: string = 'TMouseInputSystem';
  public readonly priority: number = TSystemPriority.PreUpdate;

  private query: TEntityQuery;
  constructor(
    private world: TWorld,
    private inputManager: TInputManager,
  ) {
    super();
    this.query = this.world.createQuery([TMouseInputComponent]);
  }

  public async update(
    engine: TEngine,
    world: TWorld,
    delta: number,
  ): Promise<void> {
    const entities = this.query.execute();

    for (const entity of entities) {
      const mouseInputComponent = world
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
