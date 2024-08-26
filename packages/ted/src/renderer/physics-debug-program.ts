import type TResourceManager from '../core/resource-manager';
import debugShader from '../shaders/physics-debug.program';
import TProgram from './program';
import type TRenderer from './renderer';

export default class TPhysicsDebugProgram {
  public program?: TProgram;

  constructor(
    private renderer: TRenderer,
    private resourceManager: TResourceManager,
  ) {}

  public async load() {
    this.program = await this.resourceManager.load<TProgram>(
      TProgram,
      debugShader,
    );

    const gl = this.renderer.context();
    this.program.compile(gl);
  }
}
