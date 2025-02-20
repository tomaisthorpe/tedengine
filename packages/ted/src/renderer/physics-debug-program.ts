import { generateShader } from '../shaders/chunked-shader';
import type { TShaderAttributes } from './program';
import TProgram from './program';
import type TRenderer from './renderer';
import mainBase from '../shaders/bases/main';
import colorChunk from '../shaders/chunks/color-chunk';
import { TUniformBlockBinding } from './uniform-manager';

export interface PhysicsDebugProgramUniforms {
  uMMatrix: WebGLUniformLocation | null;
}

export default class TPhysicsDebugProgram {
  public program?: TProgram;
  public uniforms?: PhysicsDebugProgramUniforms;

  private static readonly REQUIRED_UNIFORMS = ['uMMatrix'] as const;

  private static readonly ATTRIBUTES: TShaderAttributes = {
    required: [
      {
        name: 'aVertexPosition',
        size: 3,
        type: WebGL2RenderingContext.FLOAT,
        normalized: false,
      },
      {
        name: 'aVertexColor',
        size: 4,
        type: WebGL2RenderingContext.FLOAT,
        normalized: false,
      },
    ],
    optional: [],
  };

  constructor(private renderer: TRenderer) {}

  public async load() {
    const shader = generateShader(mainBase, [colorChunk]);
    this.program = TProgram.from(shader);

    const gl = this.renderer.context();
    this.program.compile(gl);

    this.program.setupUniformBlock('Global', TUniformBlockBinding.Global);
    this.program.setupAttributes(gl, TPhysicsDebugProgram.ATTRIBUTES);
    this.program.validateUniforms([...TPhysicsDebugProgram.REQUIRED_UNIFORMS]);

    this.uniforms = {
      uMMatrix: this.program.getUniformLocation('uMMatrix'),
    };
  }

  public dispose() {
    const gl = this.renderer.context();
    this.program?.dispose(gl);
    this.program = undefined;
    this.uniforms = undefined;
  }
}
