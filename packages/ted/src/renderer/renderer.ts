// @todo has limited error handling
import type { mat4 } from 'gl-matrix';
import { TSpriteLayer } from '../actor-components/sprite-component';
import type TResourceManager from '../core/resource-manager';
import type { TPalette } from '../graphics/color-material';
import TColorProgram from './color-program';
import type { TFrameParams, TSerializedSpriteInstance } from './frame-params';
import { TRenderTask } from './frame-params';
import type TProgram from './program';
import type TRenderableMesh from './renderable-mesh';
import type TRenderableTexture from './renderable-texture';
import type TRenderableTexturedMesh from './renderable-textured-mesh';
import TTexturedProgram from './textured-program';
import type TEventQueue from '../core/event-queue';
import type { TRenderingSizeChangedEvent } from './events';
import { TEventTypesRenderer } from './events';

export default class TRenderer {
  private registeredPrograms: { [key: string]: TProgram } = {};
  private registeredMeshes: { [key: string]: TRenderableMesh } = {};
  private registeredTexturedMeshes: { [key: string]: TRenderableTexturedMesh } =
    {};
  private registeredTextures: { [key: string]: TRenderableTexture } = {};
  private colorProgram?: TColorProgram;
  private texturedProgram?: TTexturedProgram;

  // @todo remove, needed for input atm
  public projectionMatrix?: mat4;

  private settingsBuffer?: WebGLBuffer;
  private settingsBufferOffsets: {
    vpMatrix: number;
  } = {
    vpMatrix: 0,
  };

  constructor(
    private canvas: HTMLCanvasElement,
    private resourceManager: TResourceManager,
    private eventQueue: TEventQueue,
  ) {}

  public async load(): Promise<void> {
    // Setup the WebGL context
    const gl = this.context();
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.clearColor(0.2, 0.2, 0.4, 1);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    this.colorProgram = new TColorProgram(this, this.resourceManager);
    await this.colorProgram.load();

    this.texturedProgram = new TTexturedProgram(this, this.resourceManager);
    await this.texturedProgram.load();

    const blockIndex = gl.getUniformBlockIndex(
      this.colorProgram.program!.program!,
      'Settings',
    );

    const blockSize = gl.getActiveUniformBlockParameter(
      this.colorProgram.program!.program!,
      blockIndex,
      gl.UNIFORM_BLOCK_DATA_SIZE,
    );

    this.settingsBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.settingsBuffer);

    // Allocate memory, dynamic used as will change often
    gl.bufferData(gl.UNIFORM_BUFFER, blockSize, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, this.settingsBuffer);

    // Get location of the uniforms
    const uboVariableIndices = gl.getUniformIndices(
      this.colorProgram.program!.program!,
      ['uVPMatrix'],
    )!;
    const uboVariableOffsets = gl.getActiveUniforms(
      this.colorProgram.program!.program!,
      uboVariableIndices,
      gl.UNIFORM_OFFSET,
    );

    this.settingsBufferOffsets.vpMatrix = uboVariableOffsets[0];

    const index = gl.getUniformBlockIndex(
      this.colorProgram.program!.program!,
      'Settings',
    );
    gl.uniformBlockBinding(this.colorProgram.program!.program!, index, 0);

    const tIndex = gl.getUniformBlockIndex(
      this.texturedProgram.program!.program!,
      'Settings',
    );
    gl.uniformBlockBinding(this.texturedProgram.program!.program!, tIndex, 0);
  }

  public context(): WebGL2RenderingContext {
    return this.canvas.getContext('webgl2')!;
  }

  public render(frameParams: TFrameParams) {
    const gl = this.context();

    // Clear the scene
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.projectionMatrix = frameParams.projectionMatrix;
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.settingsBuffer!);

    gl.bufferSubData(
      gl.UNIFORM_BUFFER,
      this.settingsBufferOffsets.vpMatrix,
      new Float32Array(frameParams.projectionMatrix),
      0,
    );

    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    const sprites: TSerializedSpriteInstance[] = [];

    for (const task of frameParams.renderTasks) {
      if (task.type === TRenderTask.SpriteInstance) {
        sprites.push(task);
        continue;
      }

      if (task.material.type === 'color') {
        gl.useProgram(this.colorProgram!.program!.program!);

        const mesh = this.registeredMeshes[task.uuid];
        mesh.render(
          gl,
          this.colorProgram!,
          task.material.options['palette'] as TPalette,
          task.transform,
        );
      } else if (task.material.type === 'textured') {
        gl.useProgram(this.texturedProgram!.program!.program!);

        const mesh = this.registeredTexturedMeshes[task.uuid];
        const texture = this.registeredTextures[task.material.options.texture];
        mesh.render(gl, this.texturedProgram!, texture, task.transform);
      }
    }

    // @todo figure out how can this can done in 3d.
    const layers: TSerializedSpriteInstance[][] = Object.values(TSpriteLayer)
      .filter((v) => !isNaN(Number(v)))
      .map(() => []);

    for (const sprite of sprites) {
      layers[sprite.layer].push(sprite);
    }

    gl.useProgram(this.texturedProgram!.program!.program!);
    for (const layer of layers) {
      for (const task of layer) {
        const mesh = this.registeredTexturedMeshes[task.uuid];
        const texture = this.registeredTextures[task.material.options.texture];
        mesh.render(gl, this.texturedProgram!, texture, task.transform);
      }
    }
  }

  public onResize() {
    const gl = this.context();
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    const event: TRenderingSizeChangedEvent = {
      type: TEventTypesRenderer.RenderingSizeChanged,
      width: this.canvas.width,
      height: this.canvas.height,
    };

    this.eventQueue.broadcast(event);
  }

  public hasProgram(uuid: string): boolean {
    return this.registeredPrograms[uuid] !== undefined;
  }

  public registerProgram(program: TProgram) {
    this.registeredPrograms[program.uuid!] = program;
  }

  public hasMesh(uuid: string): boolean {
    return this.registeredMeshes[uuid] !== undefined;
  }

  public registerMesh(mesh: TRenderableMesh) {
    this.registeredMeshes[mesh.uuid] = mesh;
  }

  public hasTexturedMesh(uuid: string): boolean {
    return this.registeredTexturedMeshes[uuid] !== undefined;
  }

  public registerTexturedMesh(mesh: TRenderableTexturedMesh) {
    this.registeredTexturedMeshes[mesh.uuid] = mesh;
  }

  public hasTexture(uuid: string): boolean {
    return this.registeredTextures[uuid] !== undefined;
  }

  public registerTexture(mesh: TRenderableTexture) {
    this.registeredTextures[mesh.uuid] = mesh;
  }
}
