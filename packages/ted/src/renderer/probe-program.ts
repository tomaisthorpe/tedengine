import type TResourceManager from '../core/resource-manager';
import TProgram from './program';
import type TRenderer from './renderer';
import mainBase from '../shaders/bases/main';
import { generateShader } from '../shaders/chunked-shader';

export default class TProbeProgram {
  public program?: TProgram;

  constructor(
    private renderer: TRenderer,
    private resourceManager: TResourceManager
  ) {}

  public async load() {
    const probeShader = generateShader(mainBase, []);
    this.program = TProgram.from(probeShader);

    const gl = this.renderer.context();
    this.program.compile(gl);
  }

  public getBlockSize() {
    const gl = this.renderer.context();
    const blockIndex = gl.getUniformBlockIndex(
      this.program!.program!,
      'Global'
    );

    const blockSize = gl.getActiveUniformBlockParameter(
      this.program!.program!,
      blockIndex,
      gl.UNIFORM_BLOCK_DATA_SIZE,
    );

    return blockSize;
  }
}
