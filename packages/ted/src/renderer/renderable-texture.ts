import { v4 as uuidv4 } from 'uuid';

/**
 * Filter = Nearest | Linear
 */
export enum TTextureFilter {
  Nearest = 0x2600,
  Linear = 0x2601,
}

export default class TRenderableTexture {
  public uuid: string = uuidv4();
  public texture?: WebGLTexture;

  public filter: TTextureFilter = TTextureFilter.Linear;

  /**
   * Returns the WebGL texture so it can be bound.
   * @param {TGraphics} graphics
   * @returns WebGLTexture
   */
  public load(gl: WebGL2RenderingContext, image: ImageBitmap) {
    this.texture = gl.createTexture()!;

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  }
}
