import TProgram from './program';
import type TRenderer from './renderer';
import { generateShader } from '../shaders/chunked-shader';
import mainBase from '../shaders/bases/main';
import paletteChunk from '../shaders/chunks/palette-vert';
import phongFrag from '../shaders/chunks/phong-frag';

export default class TColorProgram {
  public program?: TProgram;

  constructor(private renderer: TRenderer) {}

  public async load() {
    const paletteShader = generateShader(mainBase, [paletteChunk, phongFrag]);
    this.program = TProgram.from(paletteShader);

    const gl = this.renderer.context();
    this.program.compile(gl);
  }

  public getPaletteUniformLocation(
    gl: WebGL2RenderingContext,
  ): WebGLUniformLocation | undefined {
    return this.program?.getUniformLocation(gl, 'uPalette');
  }

  public getDepthTextureUniformLocation(
    gl: WebGL2RenderingContext,
  ): WebGLUniformLocation | undefined {
    return this.program?.getUniformLocation(gl, 'uDepthTexture');
  }

  public getPaletteSizeUniformLocation(
    gl: WebGL2RenderingContext,
  ): WebGLUniformLocation | undefined {
    return this.program?.getUniformLocation(gl, 'uPaletteSize');
  }

  public getDepthMatrixUniformLocation(
    gl: WebGL2RenderingContext,
  ): WebGLUniformLocation | undefined {
    return this.program?.getUniformLocation(gl, 'uDepthMatrix');
  }

  public getShadowsEnabledUniformLocation(
    gl: WebGL2RenderingContext,
  ): WebGLUniformLocation | undefined {
    return this.program?.getUniformLocation(gl, 'uShadowsEnabled');
  }
}
