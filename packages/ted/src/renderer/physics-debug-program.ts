import { generateShader } from '../shaders/chunked-shader';
import TProgram from './program';
import type TRenderer from './renderer';
import mainBase from '../shaders/bases/main';
import colorChunk from '../shaders/chunks/color-chunk';

export default class TPhysicsDebugProgram {
  public program?: TProgram;

  constructor(private renderer: TRenderer) {}

  public async load() {
    const shader = generateShader(mainBase, [colorChunk]);
    this.program = TProgram.from(shader);

    const gl = this.renderer.context();
    this.program.compile(gl);
  }
}
