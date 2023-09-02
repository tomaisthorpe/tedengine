import { vec3 } from 'gl-matrix';
import type { TTexture } from '@tedengine/ted';
import {
  TCanvas,
  TGameState,
  TActor,
  TSpriteComponent,
  TTextureFilter,
  TEngine,
} from '@tedengine/ted';

class Actor extends TActor {
  constructor(engine: TEngine, texture: TTexture) {
    super();

    const sprite = new TSpriteComponent(engine, this, 1, 1);
    sprite.setTexture(texture);

    this.rootComponent.transform.translation = vec3.fromValues(0, 0, -3);
  }
}

class CanvasState extends TGameState {
  private texture?: TTexture;

  public async onCreate(engine: TEngine) {
    const canvas = new TCanvas(engine, 100, 100);

    const ctx = canvas.getContext();
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = 'green';
    ctx.fillRect(10, 10, 80, 80);

    this.texture = await canvas.getTexture();
    this.texture.filter = TTextureFilter.Nearest;

    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const box = new Actor(engine, this.texture!);
    this.addActor(box);
  }
}

const config = {
  states: {
    game: CanvasState,
  },
  defaultState: 'game',
};

new TEngine(config, postMessage.bind(self));
