import { vec3 } from 'gl-matrix';
import {
  TBoxComponent,
  TGameState,
  TEngine,
  TPawn,
  TSimpleController,
  TEventTypesInput,
  TOrthographicCamera,
} from '@tedengine/ted';
import type {
  TController,
  TActorWithOnUpdate,
  TMouseUpEvent,
} from '@tedengine/ted';

class Cube extends TPawn implements TActorWithOnUpdate {
  constructor(engine: TEngine, x: number, y: number, z: number) {
    super();

    const controller = new TSimpleController(engine);
    controller.possess(this);

    const box = new TBoxComponent(engine, this, 100, 100, 2);
    this.rootComponent = box;

    this.rootComponent.transform.translation = vec3.fromValues(x, y, z);

    engine.events.addListener<TMouseUpEvent>(
      TEventTypesInput.MouseUp,
      (e: TMouseUpEvent) => {
        console.log(
          `You clicked on the game at (${e.screen[0]},${e.screen[1]})!`,
        );
      },
    );
  }

  async onUpdate(engine: TEngine): Promise<void> {
    if (!this.controller) {
      return;
    }

    this.controller.update();

    // @todo this feels messy
    // Get the mouse location
    const loc = this.controller.mouseLocation;
    const camera = this.world?.gameState.activeCamera;

    if (loc && camera) {
      // Convert from clip to world space
      const world = camera.clipToWorldSpace(loc.clip);
      this.rootComponent.transform.translation = vec3.fromValues(
        world[0],
        world[1],
        -10,
      );
    }
  }

  public setupController(controller: TController): void {
    super.setupController(controller);
  }
}

class ColliderState extends TGameState {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const box = new Cube(engine, 100, 100, -10);
    this.addActor(box);

    this.activeCamera = new TOrthographicCamera(engine);
  }
}

const config = {
  states: {
    game: ColliderState,
  },
  defaultState: 'game',
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
