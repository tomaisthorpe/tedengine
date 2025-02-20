import { generateShader } from '../shaders/chunked-shader';
import texturedChunk from '../shaders/chunks/textured-chunk';
import mainBase from '../shaders/bases/main';
import TProgram from './program';
import type TRenderer from './renderer';
import { TUniformBlockBinding } from './uniform-manager';

export interface TexturedProgramUniforms {
  uTexture: WebGLUniformLocation | null;
  uColorFilter: WebGLUniformLocation | null;
  uInstanceUVScale: WebGLUniformLocation | null;
  uMMatrix: WebGLUniformLocation | null;
  uEnableInstanceUVs: WebGLUniformLocation | null;
}

export default class TTexturedProgram {
  public program?: TProgram;
  public uniforms?: TexturedProgramUniforms;

  private static readonly REQUIRED_UNIFORMS = [
    'uTexture',
    'uColorFilter',
    'uInstanceUVScale',
    'uMMatrix',
    'uEnableInstanceUVs',
  ] as const;

  constructor(private renderer: TRenderer) {}

  public async load() {
    this.program = TProgram.from(generateShader(mainBase, [texturedChunk]));

    const gl = this.renderer.context();
    this.program.compile(gl);

    this.program.setupUniformBlock('Global', TUniformBlockBinding.Global);
    this.program.validateUniforms([...TTexturedProgram.REQUIRED_UNIFORMS]);

    this.uniforms = {
      uTexture: this.program.getUniformLocation(gl, 'uTexture'),
      uColorFilter: this.program.getUniformLocation(gl, 'uColorFilter'),
      uInstanceUVScale: this.program.getUniformLocation(gl, 'uInstanceUVScale'),
      uMMatrix: this.program.getUniformLocation(gl, 'uMMatrix'),
      uEnableInstanceUVs: this.program.getUniformLocation(
        gl,
        'uEnableInstanceUVs',
      ),
    };
  }

  public dispose() {
    const gl = this.renderer.context();
    this.program?.dispose(gl);
    this.program = undefined;
    this.uniforms = undefined;
  }
}
