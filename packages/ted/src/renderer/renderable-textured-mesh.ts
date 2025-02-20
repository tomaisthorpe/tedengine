import type { mat4, vec2 } from 'gl-matrix';
import { vec4 } from 'gl-matrix';
import { v4 as uuidv4 } from 'uuid';
import type TProgram from './program';
import type TRenderableTexture from './renderable-texture';
import type TTexturedProgram from './textured-program';
import type { IAsset } from '../core/resource-manager';
import OBJParser from '../utils/obj-parser';

export default class TRenderableTexturedMesh implements IAsset {
  public uuid: string = uuidv4();

  public positions: number[] = [];
  public normals: number[] = [];
  public indexes: number[] = [];
  public uvs: number[] = [];

  // Buffers
  private positionBuffer?: WebGLBuffer;
  private normalBuffer?: WebGLBuffer;
  private indexBuffer?: WebGLBuffer;
  private uvBuffer?: WebGLBuffer;

  // Instance buffers, used to override the UVs of the mesh
  private instanceUVBuffer?: WebGLBuffer;

  private source?: string;

  private vao?: WebGLVertexArrayObject;

  public async load(response: Response): Promise<void> {
    this.source = await response.text();

    this.parseModel();
  }

  public render(
    gl: WebGL2RenderingContext,
    texturedProgram: TTexturedProgram,
    texture: TRenderableTexture,
    m: mat4,
    instanceUVs?: number[],
    instanceUVScales?: vec2,
    colorFilter: vec4 = vec4.fromValues(1, 1, 1, 1),
  ) {
    if (this.positionBuffer === undefined) {
      this.createBuffers(gl);

      // Create the VAO for the vertex and color buffers
      this.createVAO(gl, texturedProgram.program!);
    }

    if (
      !this.vao ||
      !this.indexBuffer ||
      !this.uvBuffer ||
      !this.normalBuffer ||
      !this.instanceUVBuffer ||
      !texturedProgram.uniforms ||
      !texturedProgram.uniforms.uMMatrix ||
      !texturedProgram.uniforms.uEnableInstanceUVs ||
      !texturedProgram.uniforms.uInstanceUVScale ||
      !texturedProgram.uniforms.uColorFilter
    ) {
      return;
    }

    gl.bindTexture(gl.TEXTURE_2D, texture.texture!);

    gl.bindVertexArray(this.vao);

    // Bind the index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    // Send the m
    gl.uniformMatrix4fv(texturedProgram.uniforms.uMMatrix, false, m);

    gl.uniform4fv(texturedProgram.uniforms.uColorFilter, colorFilter);

    gl.uniform1f(
      texturedProgram.uniforms.uEnableInstanceUVs,
      instanceUVs ? 1 : 0,
    );

    if (instanceUVs) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceUVBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(instanceUVs),
        gl.STATIC_DRAW,
      );
    } else {
      // Even if instanceUVs are not provided, we need to bind the buffer
      // Some machines seem to require this, otherwise the shader will fail.
      gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceUVBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(this.uvs),
        gl.STATIC_DRAW,
      );
    }

    if (instanceUVScales) {
      gl.uniform2fv(
        texturedProgram.uniforms.uInstanceUVScale,
        new Float32Array(instanceUVScales),
      );
    } else {
      gl.uniform2fv(
        texturedProgram.uniforms.uInstanceUVScale,
        new Float32Array([1, 1]),
      );
    }

    const vertexCount = this.indexes.length;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;

    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  private createVAO(gl: WebGL2RenderingContext, program: TProgram) {
    const { vertexPosition, normalPosition, uvPosition, instanceUVPosition } =
      program.attribLocations;

    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);

    // Position buffer
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer!);
      gl.vertexAttribPointer(
        vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset,
      );

      gl.enableVertexAttribArray(vertexPosition);
    }

    if (normalPosition !== -1) {
      // Normal buffer

      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer!);
      gl.vertexAttribPointer(
        normalPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset,
      );

      gl.enableVertexAttribArray(normalPosition);
    }

    if (uvPosition !== -1) {
      // UV buffer

      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer!);
      gl.vertexAttribPointer(
        uvPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset,
      );

      gl.enableVertexAttribArray(uvPosition);
    }

    if (instanceUVPosition !== -1) {
      // Instance UV buffer

      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceUVBuffer!);
      gl.vertexAttribPointer(
        instanceUVPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset,
      );

      gl.enableVertexAttribArray(instanceUVPosition);
    }
  }

  /**
   * Creates the buffers and transfers the data
   */
  private createBuffers(gl: WebGL2RenderingContext): void {
    this.positionBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.positions),
      gl.STATIC_DRAW,
    );

    this.normalBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.normals),
      gl.STATIC_DRAW,
    );

    this.indexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.indexes),
      gl.STATIC_DRAW,
    );

    this.uvBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW);

    // Data will be buffered at render time if provided
    this.instanceUVBuffer = gl.createBuffer()!;
  }

  private parseModel() {
    const obj = OBJParser.parse(this.source!);

    this.positions = obj.vertices;
    this.normals = obj.normals;
    this.indexes = obj.indices;
    this.uvs = obj.uvs;
  }
}
