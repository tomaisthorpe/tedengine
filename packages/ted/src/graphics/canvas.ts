import type TEngine from '../engine/engine';
import type { TTextureOptions } from '../renderer/renderable-texture';
import TTexture from './texture';

export default class TCanvas {
  private canvas: OffscreenCanvas;
  constructor(
    private engine: TEngine,
    public width: number,
    public height: number,
  ) {
    this.canvas = new OffscreenCanvas(this.width, this.height);
  }

  public getContext(): OffscreenCanvasRenderingContext2D {
    return this.canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
  }

  public async getTexture(config?: TTextureOptions): Promise<TTexture> {
    const image = await createImageBitmap(this.canvas);
    const texture = new TTexture();
    await texture.setImageBitmap(this.engine.jobs, image, config);

    return texture;
  }
}
