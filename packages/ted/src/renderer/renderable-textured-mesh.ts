import type { mat4, vec2 } from 'gl-matrix';
import { vec4 } from 'gl-matrix';
import { v4 as uuidv4 } from 'uuid';
import type { IAsset } from '../core/resource-manager';
import OBJParser from '../utils/obj-parser';
import type TProgram from './program';
import type { TAttributeBuffer } from './program';
import type TRenderableTexture from './renderable-texture';
import type TTexturedProgram from './textured-program';

export default class TRenderableTexturedMesh implements IAsset {
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
  private instanceUVBuffer?: WebGLBuffer;

  private vao?: WebGLVertexArrayObject;

  private source?: string;

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
    gl.uniformMatrix4fv(
      texturedProgram.uniforms.uMMatrix,
      false,
      m as Float32Array,
    );

    gl.uniform4fv(
      texturedProgram.uniforms.uColorFilter,
      colorFilter as Float32Array,
    );

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
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);

    const buffers: { [key: string]: TAttributeBuffer } = {
      aVertexPosition: {
        buffer: this.positionBuffer!,
        size: 3,
        type: gl.FLOAT,
        normalized: false,
      },
      aVertexNormal: {
        buffer: this.normalBuffer!,
        size: 3,
        type: gl.FLOAT,
        normalized: false,
      },
      aVertexUV: {
        buffer: this.uvBuffer!,
        size: 2,
        type: gl.FLOAT,
        normalized: false,
      },
      aVertexInstanceUV: {
        buffer: this.instanceUVBuffer!,
        size: 2,
        type: gl.FLOAT,
        normalized: false,
      },
    };

    // Set up attributes based on program's attribute locations
    for (const [name, location] of Object.entries(program.attribLocations)) {
      if (location !== -1 && buffers[name]) {
        const buffer = buffers[name];
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
        gl.vertexAttribPointer(
          location,
          buffer.size,
          buffer.type,
          buffer.normalized,
          0,
          0,
        );
        gl.enableVertexAttribArray(location);
      }
    }
  }

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

    this.instanceUVBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceUVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW);
  }

  private parseModel() {
    const obj = OBJParser.parse(this.source!);

    this.positions = obj.vertices;
    this.normals = obj.normals;
    this.indexes = obj.indices;
    this.uvs = obj.uvs;

    this.loaded = true;
  }
}
