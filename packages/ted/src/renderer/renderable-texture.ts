import { v4 as uuidv4 } from 'uuid';

/**
 * Filter = Nearest | Linear
 */
export enum TTextureFilter {
  Nearest = 0x2600,
  Linear = 0x2601,
}

export enum TTextureWrap {
  Repeat = 0x2901,
  ClampToEdge = 0x812f,
  MirroredRepeat = 0x8370,
}

export interface TTextureOptions {
  filter?: TTextureFilter;
  wrapS?: TTextureWrap;
  wrapT?: TTextureWrap;
}

export default class TRenderableTexture {
  public uuid: string = uuidv4();
  public texture?: WebGLTexture;

  public filter: TTextureFilter = TTextureFilter.Linear;
  public wrapS: TTextureWrap = TTextureWrap.Repeat;
  public wrapT: TTextureWrap = TTextureWrap.Repeat;

  /**
   * Returns the WebGL texture so it can be bound.
   * @param {TGraphics} graphics
   * @returns WebGLTexture
   */
  public load(
    gl: WebGL2RenderingContext,
    image: ImageBitmap,
    options?: TTextureOptions,
  ) {
    this.texture = gl.createTexture()!;

    if (options?.filter !== undefined) {
      this.filter = options.filter;
    }

    if (options?.wrapS !== undefined) {
      this.wrapS = options.wrapS;
    }

    if (options?.wrapT !== undefined) {
      this.wrapT = options.wrapT;
    }

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  }
}
