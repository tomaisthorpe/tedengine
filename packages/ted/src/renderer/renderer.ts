// @todo has limited error handling
import { mat4, vec3 } from 'gl-matrix';
import { TSpriteLayer } from '../actor-components/sprite-component';
import type { TCameraView } from '../cameras/camera-view';
import type TResourceManager from '../core/resource-manager';
import { TProjectionType } from '../graphics';
import type { TPalette } from '../graphics/color-material';
import TColorProgram from './color-program';
import type { TFrameParams, TSerializedSpriteInstance } from './frame-params';
import { TRenderTask } from './frame-params';
import type TProgram from './program';
import type TRenderableMesh from './renderable-mesh';
import type TRenderableTexture from './renderable-texture';
import type TRenderableTexturedMesh from './renderable-textured-mesh';
import TTexturedProgram from './textured-program';

export default class TRenderer {
  private registeredPrograms: { [key: string]: TProgram } = {};
  private registeredMeshes: { [key: string]: TRenderableMesh } = {};
  private registeredTexturedMeshes: { [key: string]: TRenderableTexturedMesh } =
    {};
  private registeredTextures: { [key: string]: TRenderableTexture } = {};
  private colorProgram?: TColorProgram;
  private texturedProgram?: TTexturedProgram;

  public projectionMatrix?: mat4;
  public projectionScaling?: vec3;

  private settingsBuffer?: WebGLBuffer;
  private settingsBufferOffsets: {
    vpMatrix: number;
  } = {
    vpMatrix: 0,
  };

  constructor(
    private canvas: HTMLCanvasElement,
    private resourceManager: TResourceManager
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

    gl.viewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

    this.colorProgram = new TColorProgram(this, this.resourceManager);
    await this.colorProgram.load();

    this.texturedProgram = new TTexturedProgram(this, this.resourceManager);
    await this.texturedProgram.load();

    const blockIndex = gl.getUniformBlockIndex(
      this.colorProgram.program!.program!,
      'Settings'
    );

    const blockSize = gl.getActiveUniformBlockParameter(
      this.colorProgram.program!.program!,
      blockIndex,
      gl.UNIFORM_BLOCK_DATA_SIZE
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
      ['uVPMatrix']
    )!;
    const uboVariableOffsets = gl.getActiveUniforms(
      this.colorProgram.program!.program!,
      uboVariableIndices,
      gl.UNIFORM_OFFSET
    );

    this.settingsBufferOffsets.vpMatrix = uboVariableOffsets[0];

    const index = gl.getUniformBlockIndex(
      this.colorProgram.program!.program!,
      'Settings'
    );
    gl.uniformBlockBinding(this.colorProgram.program!.program!, index, 0);

    const tIndex = gl.getUniformBlockIndex(
      this.texturedProgram.program!.program!,
      'Settings'
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

    this.generateProjectionMatrix(gl, frameParams.cameraView!);

    gl.bindBuffer(gl.UNIFORM_BUFFER, this.settingsBuffer!);

    gl.bufferSubData(
      gl.UNIFORM_BUFFER,
      this.settingsBufferOffsets.vpMatrix,
      new Float32Array(this.projectionMatrix!),
      0
    );

    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    const sprites: TSerializedSpriteInstance[] = [];

    for (const task of frameParams.renderTasks) {
      if (task.type == TRenderTask.SpriteInstance) {
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
          task.transform
        );
      } else if (task.material.type === 'textured') {
        gl.useProgram(this.texturedProgram!.program!.program!);

        const mesh = this.registeredTexturedMeshes[task.uuid];
        const texture =
          this.registeredTextures[task.material.options['texture']];
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
        const texture =
          this.registeredTextures[task.material.options['texture']];
        mesh.render(gl, this.texturedProgram!, texture, task.transform);
      }
    }
  }

  private generateProjectionMatrix(
    gl: WebGL2RenderingContext,
    cameraView: TCameraView
  ): void {
    const canvas = gl.canvas as HTMLElement;

    const fieldOfView = (cameraView!.fov! * Math.PI) / 180;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projection = mat4.create();

    if (cameraView.projectionType == TProjectionType.Perspective) {
      mat4.perspective(projection, fieldOfView, aspect, zNear, zFar);
    } else {
      mat4.ortho(
        projection,
        -canvas.clientWidth / 2,
        canvas.clientWidth / 2,
        -canvas.clientHeight / 2,
        canvas.clientHeight / 2,
        zNear,
        zFar
      );
    }

    this.projectionScaling = vec3.create();

    this.projectionMatrix = projection;
    mat4.getScaling(this.projectionScaling, this.projectionMatrix);

    const cameraSpace = mat4.invert(mat4.create(), cameraView.transform);

    mat4.multiply(this.projectionMatrix, projection, cameraSpace);
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
