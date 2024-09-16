import type TResourceManager from '../core/resource-manager';
import basicShader from '../shaders/textured.program';
import TProgram from './program';
import type TRenderer from './renderer';

export default class TTexturedProgram {
  public program?: TProgram;

  constructor(
    private renderer: TRenderer,
    private resourceManager: TResourceManager,
  ) {}

  public async load() {
    this.program = await this.resourceManager.load<TProgram>(
      TProgram,
      basicShader,
    );

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
}
