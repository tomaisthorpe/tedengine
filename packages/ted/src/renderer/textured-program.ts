import { generateShader } from '../shaders/chunked-shader';
import { texturedChunk } from '../shaders/chunks/textured-chunk';
import { mainShader } from '../shaders/bases/main';
import type { TShaderAttributes } from './program';
import { TProgram } from './program';
import type { TRenderer } from './renderer';
import { TUniformBlockBinding } from './uniform-manager';

export interface TexturedProgramUniforms {
  uTexture: WebGLUniformLocation | null;
  uColorFilter: WebGLUniformLocation | null;
  uInstanceUVScale: WebGLUniformLocation | null;
  uMMatrix: WebGLUniformLocation | null;
  uEnableInstanceUVs: WebGLUniformLocation | null;
}

export class TTexturedProgram {
  public program?: TProgram;
  public uniforms?: TexturedProgramUniforms;

  private static readonly REQUIRED_UNIFORMS = [
    'uTexture',
    'uColorFilter',
    'uInstanceUVScale',
    'uMMatrix',
    'uEnableInstanceUVs',
  ] as const;

  private static readonly ATTRIBUTES: TShaderAttributes = {
    required: [
      {
        name: 'aVertexPosition',
        size: 3,
        type: WebGL2RenderingContext.FLOAT,
        normalized: false,
      },
      {
        name: 'aVertexUV',
        size: 2,
        type: WebGL2RenderingContext.FLOAT,
        normalized: false,
      },
    ],
    optional: [
      {
        name: 'aVertexNormal',
        size: 3,
        type: WebGL2RenderingContext.FLOAT,
        normalized: false,
      },
      {
        name: 'aVertexInstanceUV',
        size: 2,
        type: WebGL2RenderingContext.FLOAT,
        normalized: false,
      },
    ],
  };

  constructor(private renderer: TRenderer) {}

  public async load() {
    this.program = TProgram.from(generateShader(mainShader, [texturedChunk]));

    const gl = this.renderer.context();
    this.program.compile(gl);

    this.program.setupUniformBlock('Global', TUniformBlockBinding.Global);
    this.program.setupAttributes(gl, TTexturedProgram.ATTRIBUTES);
    this.program.validateUniforms([...TTexturedProgram.REQUIRED_UNIFORMS]);

    this.uniforms = {
      uTexture: this.program.getUniformLocation('uTexture'),
      uColorFilter: this.program.getUniformLocation('uColorFilter'),
      uInstanceUVScale: this.program.getUniformLocation('uInstanceUVScale'),
      uMMatrix: this.program.getUniformLocation('uMMatrix'),
      uEnableInstanceUVs: this.program.getUniformLocation('uEnableInstanceUVs'),
    };
  }

  public dispose() {
    const gl = this.renderer.context();
    this.program?.dispose(gl);
    this.program = undefined;
    this.uniforms = undefined;
  }
}
