import type { mat4 } from 'gl-matrix';
import { v4 as uuidv4 } from 'uuid';
import type TProgram from './program';
import type TRenderableTexture from './renderable-texture';
import type TTexturedProgram from './textured-program';

export default class TRenderableTexturedMesh {
  public uuid: string = uuidv4();

  public positions: number[] = [];
  public normals: number[] = [];
  public indexes: number[] = [];
  public uvs: number[] = [];
  public loaded = false;

  // Buffers
  private positionBuffer?: WebGLBuffer;
  private normalBuffer?: WebGLBuffer;
  private indexBuffer?: WebGLBuffer;
  private uvBuffer?: WebGLBuffer;

  private vao?: WebGLVertexArrayObject;

  public render(
    gl: WebGL2RenderingContext,
    texturedProgram: TTexturedProgram,
    texture: TRenderableTexture,
    m: mat4
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
      !this.normalBuffer
    ) {
      return;
    }

    gl.bindTexture(gl.TEXTURE_2D, texture.texture!);

    gl.bindVertexArray(this.vao);

    // Bind the index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    // Send the m
    gl.uniformMatrix4fv(
      texturedProgram.program!.uniformLocations.mMatrix,
      false,
      m
    );

    const vertexCount = this.indexes.length;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;

    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  private createVAO(gl: WebGL2RenderingContext, program: TProgram) {
    const { vertexPosition, normalPosition, uvPosition } =
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
        offset
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
        offset
      );

      gl.enableVertexAttribArray(normalPosition);
    }

    if (uvPosition !== -1) {
      // Color buffer

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
        offset
      );

      gl.enableVertexAttribArray(uvPosition);
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
      gl.STATIC_DRAW
    );

    this.normalBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.normals),
      gl.STATIC_DRAW
    );

    this.indexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.indexes),
      gl.STATIC_DRAW
    );

    this.uvBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW);
  }
}
