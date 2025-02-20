import { v4 as uuidv4 } from 'uuid';
import type { IAsset } from '../core/resource-manager';
import type { TShader } from '../shaders/chunked-shader';
import { TUniformManager } from './uniform-manager';

const compileShader = (
  gl: WebGL2RenderingContext,
  shaderSource: string,
  shaderType: number,
): WebGLShader => {
  // @todo add error handling here
  const shader = gl.createShader(shaderType);
  gl.shaderSource(shader!, shaderSource);
  gl.compileShader(shader!);

  const success = gl.getShaderParameter(shader!, gl.COMPILE_STATUS);
  if (success !== true) {
    throw new Error(`Could not compile shader ${gl.getShaderInfoLog(shader!)}`);
  }

  return shader!;
};

const createProgram = (
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
) => {
  // @todo add error handling here
  const program = gl.createProgram();

  gl.attachShader(program!, vertexShader);
  gl.attachShader(program!, fragmentShader);

  gl.linkProgram(program!);

  const success = gl.getProgramParameter(program!, gl.LINK_STATUS);
  if (success !== true) {
    throw new Error(`Could not link program ${gl.getProgramInfoLog(program!)}`);
  }

  return program!;
};

export default class TProgram implements IAsset {
  /**
   * Boolean to save whether the program has been compiled yet.
   */
  public compiled = false;
  public program?: WebGLProgram;
  public attribLocations: Record<string, number> = {};
  private uniformManager?: TUniformManager;

  private vertexShaderSource?: string;
  private fragmentShaderSource?: string;

  // Renderer will use uuid to check if it already has this program
  public uuid?: string;

  public static from(shader: TShader) {
    const program = new TProgram();
    program.vertexShaderSource = shader.vertexShader;
    program.fragmentShaderSource = shader.fragmentShader;
    return program;
  }

  public async load(response: Response): Promise<void> {
    this.uuid = uuidv4();

    const fullProgram = await response.text();

    const [vertexShaderSource, fragmentShaderSource] =
      fullProgram.split('----\n');
    this.vertexShaderSource = vertexShaderSource;
    this.fragmentShaderSource = fragmentShaderSource;
  }

  /**
   * Compile the current program given a GLContext
   */
  public compile(gl: WebGL2RenderingContext) {
    const vertexShader = compileShader(
      gl,
      this.vertexShaderSource!,
      gl.VERTEX_SHADER,
    );
    const fragmentShader = compileShader(
      gl,
      this.fragmentShaderSource!,
      gl.FRAGMENT_SHADER,
    );

    this.program = createProgram(gl, vertexShader, fragmentShader);
    this.compiled = true;

    this.uniformManager = new TUniformManager(gl, this.program);

    this.attribLocations.vertexPosition = gl.getAttribLocation(
      this.program,
      'aVertexPosition',
    );
    this.attribLocations.normalPosition = gl.getAttribLocation(
      this.program,
      'aVertexNormal',
    );
    this.attribLocations.colorPosition = gl.getAttribLocation(
      this.program,
      'aVertexColor',
    );
    this.attribLocations.uvPosition = gl.getAttribLocation(
      this.program,
      'aVertexUV',
    );
    this.attribLocations.instanceUVPosition = gl.getAttribLocation(
      this.program,
      'aVertexInstanceUV',
    );
  }

  public getUniformLocation(
    gl: WebGL2RenderingContext,
    name: string,
  ): WebGLUniformLocation | null {
    if (!this.uniformManager) {
      throw new Error('Program not compiled');
    }
    return this.uniformManager.getUniformLocation(name);
  }

  public setupUniformBlock(
    blockName: string,
    bindingPoint: number,
    uniformNames?: string[],
  ) {
    if (!this.uniformManager) {
      throw new Error('Program not compiled');
    }
    return this.uniformManager.setupUniformBlock(
      blockName,
      bindingPoint,
      uniformNames,
    );
  }

  public getUniformBlockOffsets(
    gl: WebGL2RenderingContext,
    blockName: string,
    uniformNames: string[],
  ) {
    if (!this.uniformManager) {
      throw new Error('Program not compiled');
    }
    return this.uniformManager.getUniformBlockOffsets(blockName, uniformNames);
  }

  public validateUniforms(
    requiredUniforms: string[],
    blockUniforms: string[] = [],
  ) {
    if (!this.uniformManager) {
      throw new Error('Program not compiled');
    }
    this.uniformManager.validateUniforms(requiredUniforms, blockUniforms);
  }

  public dispose(gl: WebGL2RenderingContext) {
    if (this.program) {
      gl.deleteProgram(this.program);
      this.program = undefined;
      this.compiled = false;
      this.uniformManager?.clearCache();
      this.uniformManager = undefined;
    }
  }
}
