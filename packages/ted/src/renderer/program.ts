import { v4 as uuidv4 } from 'uuid';
import type { IAsset } from '../core/resource-manager';
import type { TShader } from '../shaders/chunked-shader';

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
  public attribLocations: any = {};
  public uniformLocations: any = {};

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

    this.uniformLocations.mMatrix = gl.getUniformLocation(
      this.program,
      'uMMatrix',
    );

    this.uniformLocations.uPalette = gl.getUniformLocation(
      this.program,
      'uPalette',
    );

    this.uniformLocations.uEnableInstanceUVs = gl.getUniformLocation(
      this.program,
      'uEnableInstanceUVs',
    );

    this.uniformLocations.uTexture = gl.getUniformLocation(
      this.program,
      'uDepthTexture',
    );
  }

  public getAttributeLocations(
    gl: WebGL2RenderingContext,
    attributes: string[],
  ): WebGLUniformLocation[] {
    return attributes.map(
      (attribute) => gl.getUniformLocation(this.program!, attribute)!,
    );
  }

  public getUniformLocation(
    gl: WebGL2RenderingContext,
    name: string,
  ): WebGLUniformLocation {
    if (!this.uniformLocations[name]) {
      this.uniformLocations[name] = gl.getUniformLocation(this.program!, name);
    }

    return this.uniformLocations[name];
  }

  public getUniformOffsets(
    gl: WebGL2RenderingContext,
    uniforms: string[],
  ): number[] {
    const uboVariableIndices = gl.getUniformIndices(this.program!, uniforms);

    if (!uboVariableIndices) {
      throw new Error('Could not get uniform indices');
    }

    const uboVariableOffsets = gl.getActiveUniforms(
      this.program!,
      uboVariableIndices,
      gl.UNIFORM_OFFSET,
    );

    if (!uboVariableOffsets) {
      throw new Error('Could not get uniform offsets');
    }

    return uboVariableOffsets;
  }
}
