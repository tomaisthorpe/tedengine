import type TResourceManager from '../core/resource-manager';
import basicShader from '../shaders/color.program';
import TProgram from './program';
import type TRenderer from './renderer';

export default class TColorProgram {
  public program?: TProgram;

  constructor(
    private renderer: TRenderer,
    private resourceManager: TResourceManager
  ) {}

  public async load() {
    this.program = await this.resourceManager.load<TProgram>(
      TProgram,
      basicShader
    );

    const gl = this.renderer.context();
    this.program.compile(gl);
  }

  public getPaletteUniformLocation(
    gl: WebGL2RenderingContext
  ): WebGLUniformLocation | undefined {
    return this.program?.getUniformLocation(gl, 'uPalette');
  }

  public getPaletteSizeUniformLocation(
    gl: WebGL2RenderingContext
  ): WebGLUniformLocation | undefined {
    return this.program?.getUniformLocation(gl, 'uPaletteSize');
  }
}
