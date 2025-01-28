import TProgram from './program';
import type TRenderer from './renderer';
import { generateShader } from '../shaders/chunked-shader';
import mainBase from '../shaders/bases/main';
import paletteChunk from '../shaders/chunks/palette-vert';
import phongFrag from '../shaders/chunks/phong-frag';

export default class TColorProgram {
  public program?: TProgram;
  public uniforms?: {
    uPalette: WebGLUniformLocation | undefined;
    uDepthTexture: WebGLUniformLocation | undefined;
    uPaletteSize: WebGLUniformLocation | undefined;
    uDepthMatrix: WebGLUniformLocation | undefined;
    uShadowsEnabled: WebGLUniformLocation | undefined;
    uMMatrix: WebGLUniformLocation | undefined;
  };

  constructor(private renderer: TRenderer) {}

  public async load() {
    const paletteShader = generateShader(mainBase, [paletteChunk, phongFrag]);
    this.program = TProgram.from(paletteShader);

    const gl = this.renderer.context();
    this.program.compile(gl);

    this.uniforms = {
      uPalette: this.program.getUniformLocation(gl, 'uPalette'),
      uDepthTexture: this.program.getUniformLocation(gl, 'uDepthTexture'),
      uPaletteSize: this.program.getUniformLocation(gl, 'uPaletteSize'),
      uDepthMatrix: this.program.getUniformLocation(gl, 'uDepthMatrix'),
      uShadowsEnabled: this.program.getUniformLocation(gl, 'uShadowsEnabled'),
      uMMatrix: this.program.getUniformLocation(gl, 'uMMatrix'),
    };
  }
}
