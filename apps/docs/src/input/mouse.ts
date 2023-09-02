import { vec3 } from 'gl-matrix';
import {
  TBoxComponent,
  TGameState,
  TEngine,
  TPawn,
  TSimpleController,
  TEventTypesInput,
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

    const box = new TBoxComponent(engine, this, 1, 1, 1);
    this.rootComponent = box;

    this.rootComponent.transform.translation = vec3.fromValues(x, y, z);

    engine.events.addListener<TMouseUpEvent>(
      TEventTypesInput.MouseUp,
      (e: TMouseUpEvent) => {
        console.log(`You clicked on the game at (${e.x},${e.y})!`);
      }
    );
  }

  async onUpdate(): Promise<void> {
    if (!this.controller) {
      return;
    }

    this.controller.update();

    // Get the mouse location
    console.log(this.controller.mouseLocation);
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
    const box = new Cube(engine, 0, 0, -10);
    this.addActor(box);
  }
}

const config = {
  states: {
    game: ColliderState,
  },
  defaultState: 'game',
};

new TEngine(config, postMessage.bind(self));
