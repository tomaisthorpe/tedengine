export interface TFrameBufferOptions {
  width: number;
  height: number;
}

export default class TFrameBuffer {
  private frameBuffer: WebGLFramebuffer;
  private texture: WebGLTexture;

  constructor(
    private gl: WebGL2RenderingContext,
    private options: TFrameBufferOptions,
  ) {
    this.texture = gl.createTexture()!;

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      options.width,
      options.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.frameBuffer = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.texture,
      0,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /**
   * Bind the frame buffer and set the viewport to the frame buffer size
   */
  public bind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    this.gl.viewport(0, 0, this.options.width, this.options.height);
  }

  public unbind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }
}
