import TProgram from './program';
import type TRenderer from './renderer';
import { generateShader } from '../shaders/chunked-shader';
import mainBase from '../shaders/bases/main';
import paletteChunk from '../shaders/chunks/palette-vert';
import phongFrag from '../shaders/chunks/phong-frag';
import { TUniformBlockBinding } from './uniform-manager';

export interface ColorProgramUniforms {
  uPalette: WebGLUniformLocation | null;
  uDepthTexture: WebGLUniformLocation | null;
  uPaletteSize: WebGLUniformLocation | null;
  uDepthMatrix: WebGLUniformLocation | null;
  uShadowsEnabled: WebGLUniformLocation | null;
  uMMatrix: WebGLUniformLocation | null;
}

export default class TColorProgram {
  public program?: TProgram;
  public uniforms?: ColorProgramUniforms;

  private static readonly REQUIRED_UNIFORMS = [
    'uPalette',
    'uDepthTexture',
    'uPaletteSize',
    'uDepthMatrix',
    'uShadowsEnabled',
    'uMMatrix',
  ] as const;

  constructor(private renderer: TRenderer) {}

  public async load() {
    const paletteShader = generateShader(mainBase, [paletteChunk, phongFrag]);
    this.program = TProgram.from(paletteShader);

    const gl = this.renderer.context();
    this.program.compile(gl);

    this.program.setupUniformBlock('Global', TUniformBlockBinding.Global);
    this.program.setupUniformBlock('Lighting', TUniformBlockBinding.Lighting);

    this.program.validateUniforms([...TColorProgram.REQUIRED_UNIFORMS]);

    this.uniforms = {
      uPalette: this.program.getUniformLocation(gl, 'uPalette'),
      uDepthTexture: this.program.getUniformLocation(gl, 'uDepthTexture'),
      uPaletteSize: this.program.getUniformLocation(gl, 'uPaletteSize'),
      uDepthMatrix: this.program.getUniformLocation(gl, 'uDepthMatrix'),
      uShadowsEnabled: this.program.getUniformLocation(gl, 'uShadowsEnabled'),
      uMMatrix: this.program.getUniformLocation(gl, 'uMMatrix'),
    };
  }

  public dispose() {
    const gl = this.renderer.context();
    this.program?.dispose(gl);
    this.program = undefined;
    this.uniforms = undefined;
  }
}
