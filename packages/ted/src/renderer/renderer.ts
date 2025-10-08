// @todo has limited error handling
import { mat4, vec3 } from 'gl-matrix';
import { TSpriteLayer } from '../components/sprite-component';
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
import TPhysicsDebugProgram from './physics-debug-program';
import TPhysicsDebug from './physics-debug';
import TProbeProgram from './probe-program';
import TFrameBuffer from './frame-buffer';

export default class TRenderer {
  private registeredPrograms: { [key: string]: TProgram } = {};
  private registeredMeshes: { [key: string]: TRenderableMesh } = {};
  private registeredTexturedMeshes: { [key: string]: TRenderableTexturedMesh } =
    {};
  private registeredTextures: { [key: string]: TRenderableTexture } = {};
  private colorProgram?: TColorProgram;
  private texturedProgram?: TTexturedProgram;
  private physicsDebugProgram?: TPhysicsDebugProgram;

  private physicsDebug?: TPhysicsDebug;

  private shadowMap?: TFrameBuffer;

  // @todo remove, needed for input atm
  public projectionMatrix?: mat4;

  private globalUniformBuffer?: WebGLBuffer;
  private globalUniformBufferOffsets: {
    vpMatrix: number;
  } = {
    vpMatrix: 0,
  };

  private lightingUniformBuffer?: WebGLBuffer;
  private lightingUniformBufferOffsets: {
    ambientLight: number;
    directionalLightDir: number;
    directionalLight: number;
  } = {
    ambientLight: 0,
    directionalLightDir: 0,
    directionalLight: 0,
  };

  private clearColor: { r: number; g: number; b: number; a: number };

  constructor(
    private canvas: HTMLCanvasElement,
    private resourceManager: TResourceManager,
    private eventQueue: TEventQueue,
    clearColor?: { r: number; g: number; b: number; a: number },
  ) {
    this.clearColor = clearColor ?? { r: 0.2, g: 0.2, b: 0.4, a: 1 };
  }

  public async load(): Promise<void> {
    // Setup the WebGL context
    const gl = this.context();
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Set clear color from config or use default
    gl.clearColor(
      this.clearColor.r,
      this.clearColor.g,
      this.clearColor.b,
      this.clearColor.a,
    );
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.LEQUAL);

    // Load probe program so we can determine the size of the UBO
    const probeProgram = new TProbeProgram(this);
    await probeProgram.load();

    this.colorProgram = new TColorProgram(this);
    await this.colorProgram.load();

    this.texturedProgram = new TTexturedProgram(this);
    await this.texturedProgram.load();

    this.physicsDebugProgram = new TPhysicsDebugProgram(this);
    await this.physicsDebugProgram.load();

    this.physicsDebug = new TPhysicsDebug();

    const blockSize = probeProgram.getBlockSize();

    this.globalUniformBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.globalUniformBuffer);

    // Allocate memory, dynamic used as will change often
    gl.bufferData(gl.UNIFORM_BUFFER, blockSize, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, this.globalUniformBuffer);

    this.lightingUniformBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.lightingUniformBuffer);
    gl.bufferData(gl.UNIFORM_BUFFER, blockSize, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 1, this.lightingUniformBuffer);

    // Get location of the uniforms
    const globalOffsets = probeProgram.program!.getUniformBlockOffsets(
      gl,
      'Global',
      ['uVPMatrix'],
    );

    const lightingOffsets = probeProgram.program!.getUniformBlockOffsets(
      gl,
      'Lighting',
      ['uAmbientLight', 'uDirectionalLightDir', 'uDirectionalLight'],
    );

    this.globalUniformBufferOffsets.vpMatrix = globalOffsets['uVPMatrix'];
    this.lightingUniformBufferOffsets.ambientLight =
      lightingOffsets['uAmbientLight'];
    this.lightingUniformBufferOffsets.directionalLightDir =
      lightingOffsets['uDirectionalLightDir'];
    this.lightingUniformBufferOffsets.directionalLight =
      lightingOffsets['uDirectionalLight'];

    // Create shadow map buffers
    // This will only be used if shadows are enabled
    this.shadowMap = new TFrameBuffer(gl, {
      width: 1024,
      height: 1024,
    });
  }

  public context(): WebGL2RenderingContext {
    return this.canvas.getContext('webgl2', {
      alpha: false,
    })!;
  }

  private renderShadowMap(
    gl: WebGL2RenderingContext,
    frameParams: TFrameParams,
  ): {
    depthTexture?: WebGLTexture;
    depthProjectionMatrix?: mat4;
    depthViewMatrix?: mat4;
  } {
    // Currently only directional light is supported
    // So if shadows are not enabled or there is no directional light, we can skip the shadow map
    if (
      !frameParams.lighting.shadows?.enabled ||
      !frameParams.lighting.directionalLight
    ) {
      return {};
    }

    this.shadowMap?.bind();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.UNIFORM_BUFFER, this.globalUniformBuffer!);

    // shadow map uses a projection map that is based on directional light
    const directionalLight = frameParams.lighting.directionalLight!;
    const directionalLightDir = vec3.normalize(
      vec3.create(),
      directionalLight.direction,
    );

    // Create a projection
    // Not sure what these values should be
    const projectionMatrix = mat4.perspective(
      mat4.create(),
      (45 * Math.PI) / 180,
      1,
      2,
      100,
    );
    // Light position, based on directional light
    const lightPosition = vec3.scale(vec3.create(), directionalLightDir, 4);
    const viewMatrix = mat4.lookAt(
      mat4.create(),
      lightPosition,
      vec3.create(),
      vec3.fromValues(0, 1, 0),
    );

    const vpMatrix = mat4.multiply(mat4.create(), projectionMatrix, viewMatrix);

    gl.bufferSubData(
      gl.UNIFORM_BUFFER,
      this.globalUniformBufferOffsets.vpMatrix,
      new Float32Array(vpMatrix),
      0,
    );

    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    for (const task of frameParams.renderTasks) {
      if (
        task.type === TRenderTask.MeshInstance &&
        task.material.type === 'color'
      ) {
        gl.useProgram(this.colorProgram!.program!.program!);

        const mesh = this.registeredMeshes[task.uuid];
        mesh.render(
          gl,
          this.colorProgram!,
          task.material.options['palette'] as TPalette,
          task.transform,
        );
      }
    }

    this.shadowMap?.unbind();

    return {
      depthTexture: this.shadowMap!.depthTexture,
      depthProjectionMatrix: projectionMatrix,
      depthViewMatrix: viewMatrix,
    };
  }

  public render(frameParams: TFrameParams) {
    const gl = this.context();

    const { depthProjectionMatrix, depthViewMatrix } = this.renderShadowMap(
      gl,
      frameParams,
    );

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // Clear the scene
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.projectionMatrix = frameParams.projectionMatrix;
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.globalUniformBuffer!);

    gl.bufferSubData(
      gl.UNIFORM_BUFFER,
      this.globalUniformBufferOffsets.vpMatrix,
      new Float32Array(frameParams.projectionMatrix),
      0,
    );

    const ambientLight = frameParams.lighting.ambientLight;
    const ambientLightColor = ambientLight?.color || vec3.fromValues(1, 1, 1);

    gl.bindBuffer(gl.UNIFORM_BUFFER, this.lightingUniformBuffer!);
    gl.bufferSubData(
      gl.UNIFORM_BUFFER,
      this.lightingUniformBufferOffsets.ambientLight,
      new Float32Array([
        ambientLightColor[0],
        ambientLightColor[1],
        ambientLightColor[2],
        ambientLight?.intensity !== undefined ? ambientLight.intensity : 1.0,
      ]),
      0,
    );

    const directionalLight = frameParams.lighting.directionalLight;
    if (directionalLight) {
      const directionalLightDir = vec3.normalize(
        vec3.create(),
        directionalLight.direction,
      );

      gl.bufferSubData(
        gl.UNIFORM_BUFFER,
        this.lightingUniformBufferOffsets.directionalLightDir,
        new Float32Array(directionalLightDir),
        0,
      );

      const directionalLightColor =
        directionalLight.color || vec3.fromValues(1, 1, 1);
      gl.bufferSubData(
        gl.UNIFORM_BUFFER,
        this.lightingUniformBufferOffsets.directionalLight,
        new Float32Array([
          directionalLightColor[0],
          directionalLightColor[1],
          directionalLightColor[2],
          directionalLight.intensity,
        ]),
        0,
      );
    } else {
      gl.bufferSubData(
        gl.UNIFORM_BUFFER,
        this.lightingUniformBufferOffsets.directionalLightDir,
        new Float32Array([0, 0, 0]),
        0,
      );

      gl.bufferSubData(
        gl.UNIFORM_BUFFER,
        this.lightingUniformBufferOffsets.directionalLight,
        new Float32Array([0, 0, 0, 0]),
        0,
      );
    }

    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    const sprites: TSerializedSpriteInstance[] = [];

    for (const task of frameParams.renderTasks) {
      if (task.type === TRenderTask.SpriteInstance) {
        sprites.push(task);
        continue;
      }

      if (task.type === TRenderTask.SpriteInstances) {
        for (const instance of task.instances) {
          sprites.push({
            type: TRenderTask.SpriteInstance,
            uuid: task.uuid,
            transform: instance.transform,
            material: instance.material ?? task.material,
            layer: task.layer,
          });
        }
        continue;
      }

      if (task.type === TRenderTask.PhysicsDebug) {
        gl.useProgram(this.physicsDebugProgram!.program!.program!);

        this.physicsDebug?.render(
          gl,
          this.physicsDebugProgram!,
          task.vertices,
          task.colors,
        );

        continue;
      }

      if (task.material.type === 'color') {
        gl.useProgram(this.colorProgram!.program!.program!);

        if (depthProjectionMatrix && depthViewMatrix) {
          const depthTexture = this.shadowMap?.depthTexture;
          const textureUniformLocation =
            this.colorProgram?.uniforms?.uDepthTexture;
          if (textureUniformLocation && depthTexture) {
            gl.uniform1i(textureUniformLocation, 1);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, depthTexture);

            const depthMatrixUniformLocation =
              this.colorProgram?.uniforms?.uDepthMatrix;
            if (depthMatrixUniformLocation) {
              let depthTextureMatrix = mat4.identity(mat4.create());

              depthTextureMatrix = mat4.multiply(
                depthTextureMatrix,
                depthTextureMatrix,
                depthProjectionMatrix,
              );
              depthTextureMatrix = mat4.multiply(
                depthTextureMatrix,
                depthTextureMatrix,
                depthViewMatrix,
              );

              gl.uniformMatrix4fv(
                depthMatrixUniformLocation,
                false,
                depthTextureMatrix as Float32Array,
              );

              const shadowsEnabledUniformLocation =
                this.colorProgram?.uniforms?.uShadowsEnabled;
              if (shadowsEnabledUniformLocation) {
                gl.uniform1f(shadowsEnabledUniformLocation, 1);
              }
            }
          } else {
            const shadowsEnabledUniformLocation =
              this.colorProgram?.uniforms?.uShadowsEnabled;
            if (shadowsEnabledUniformLocation) {
              gl.uniform1f(shadowsEnabledUniformLocation, 0);
            }
          }
        } else {
          const shadowsEnabledUniformLocation =
            this.colorProgram?.uniforms?.uShadowsEnabled;
          if (shadowsEnabledUniformLocation) {
            gl.uniform1f(shadowsEnabledUniformLocation, 0);
          }
        }

        const mesh = this.registeredMeshes[task.uuid];
        mesh.render(
          gl,
          this.colorProgram!,
          task.material.options['palette'] as TPalette,
          task.transform,
        );

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);

        // gl.bindTexture(gl.TEXTURE_2D, null);
      } else if (task.material.type === 'textured') {
        gl.useProgram(this.texturedProgram!.program!.program!);

        // Ensure textured draws sample from texture unit 0
        const uTextureLoc = this.texturedProgram?.uniforms?.uTexture;
        if (uTextureLoc) {
          gl.uniform1i(uTextureLoc, 0);
        }
        gl.activeTexture(gl.TEXTURE0);

        const mesh = this.registeredTexturedMeshes[task.uuid];
        const texture = this.registeredTextures[task.material.options.texture];
        mesh.render(
          gl,
          this.texturedProgram!,
          texture,
          task.transform,
          task.material.options.instanceUVs,
          task.material.options.instanceUVScales,
          task.material.options.colorFilter,
        );
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
    // Ensure textured draws sample from texture unit 0
    const uTextureLoc = this.texturedProgram?.uniforms?.uTexture;
    if (uTextureLoc) {
      gl.uniform1i(uTextureLoc, 0);
    }
    gl.activeTexture(gl.TEXTURE0);
    for (const layer of layers) {
      for (const task of layer) {
        const mesh = this.registeredTexturedMeshes[task.uuid];
        const texture = this.registeredTextures[task.material.options.texture];
        mesh.render(
          gl,
          this.texturedProgram!,
          texture,
          task.transform,
          task.material.options.instanceUVs,
          task.material.options.instanceUVScales,
          task.material.options.colorFilter,
        );
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
