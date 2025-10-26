import type { TShaderAttributes } from './program';
import { TProgram } from './program';
import type { TRenderer } from './renderer';
import { mainShader } from '../shaders/bases/main';
import { generateShader } from '../shaders/chunked-shader';
import { TUniformBlockBinding } from './uniform-manager';

const GLOBAL_BLOCK_UNIFORMS = ['uVPMatrix'] as const;
const LIGHTING_BLOCK_UNIFORMS = [
  'uAmbientLight',
  'uDirectionalLightDir',
  'uDirectionalLight',
] as const;

export interface ProbeProgramUniforms {
  globalBlock: {
    vpMatrix: number;
  };
  lightingBlock: {
    ambientLight: number;
    directionalLightDir: number;
    directionalLight: number;
  };
}

export class TProbeProgram {
  public program?: TProgram;
  public uniforms?: ProbeProgramUniforms;

  private static readonly ATTRIBUTES: TShaderAttributes = {
    required: [
      {
        name: 'aVertexPosition',
        size: 3,
        type: WebGL2RenderingContext.FLOAT,
        normalized: false,
      },
    ],
    optional: [],
  };

  constructor(private renderer: TRenderer) {}

  public async load() {
    const probeShader = generateShader(mainShader, []);
    this.program = TProgram.from(probeShader);

    const gl = this.renderer.context();
    this.program.compile(gl);

    this.program.setupAttributes(gl, TProbeProgram.ATTRIBUTES);

    const globalBlock = this.program.setupUniformBlock(
      'Global',
      TUniformBlockBinding.Global,
      [...GLOBAL_BLOCK_UNIFORMS],
    );

    const lightingBlock = this.program.setupUniformBlock(
      'Lighting',
      TUniformBlockBinding.Lighting,
      [...LIGHTING_BLOCK_UNIFORMS],
    );

    this.uniforms = {
      globalBlock: {
        vpMatrix: globalBlock.uniforms['uVPMatrix'],
      },
      lightingBlock: {
        ambientLight: lightingBlock.uniforms['uAmbientLight'],
        directionalLightDir: lightingBlock.uniforms['uDirectionalLightDir'],
        directionalLight: lightingBlock.uniforms['uDirectionalLight'],
      },
    };
  }

  public getBlockSize() {
    if (!this.program?.program) {
      throw new Error('Program must be loaded before getting block size');
    }

    const gl = this.renderer.context();
    const blockIndex = gl.getUniformBlockIndex(
      this.program.program,
      'Global',
    );

    const blockSize = gl.getActiveUniformBlockParameter(
      this.program.program,
      blockIndex,
      gl.UNIFORM_BLOCK_DATA_SIZE,
    );

    return blockSize;
  }

  public dispose() {
    const gl = this.renderer.context();
    this.program?.dispose(gl);
    this.program = undefined;
    this.uniforms = undefined;
  }
}
