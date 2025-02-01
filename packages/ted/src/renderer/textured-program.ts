import { generateShader } from '../shaders/chunked-shader';
import texturedChunk from '../shaders/chunks/textured-chunk';
import mainBase from '../shaders/bases/main';

import TProgram from './program';
import type TRenderer from './renderer';

export default class TTexturedProgram {
  public program?: TProgram;

  constructor(private renderer: TRenderer) {}

  public async load() {
    this.program = TProgram.from(generateShader(mainBase, [texturedChunk]));

    const gl = this.renderer.context();
    this.program.compile(gl);
  }

  public getTextureUniformLocation(
    gl: WebGL2RenderingContext,
  ): WebGLUniformLocation | undefined {
    return this.program?.getUniformLocation(gl, 'uTexture');
  }

  public getColorFilterUniformLocation(
    gl: WebGL2RenderingContext,
  ): WebGLUniformLocation | undefined {
    return this.program?.getUniformLocation(gl, 'uColorFilter');
  }

  public getInstanceUVScaleUniformLocation(
    gl: WebGL2RenderingContext,
  ): WebGLUniformLocation | undefined {
    return this.program?.getUniformLocation(gl, 'uInstanceUVScale');
  }
}
