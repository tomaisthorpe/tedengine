// @todo this file is missing a lot of error handling
import type { mat4 } from 'gl-matrix';
import { v4 as uuidv4 } from 'uuid';
import type { IAsset } from '../core/resource-manager';
import type { TPalette } from '../graphics/color-material';
import OBJParser from '../utils/obj-parser';
import type TColorProgram from './color-program';
import type TProgram from './program';
import type { TAttributeBuffer } from './program';

export interface TPaletteIndex {
  [key: string]: number;
}

export default class TRenderableMesh implements IAsset {
  public uuid: string = uuidv4();

  public positions: number[] = [];
  public normals: number[] = [];
  public indexes: number[] = [];
  public colors: number[] = [];
  public palette: TPaletteIndex = {};

  public loaded = false;
  // Buffers
  private positionBuffer?: WebGLBuffer;
  private normalBuffer?: WebGLBuffer;
  private indexBuffer?: WebGLBuffer;
  private colorBuffer?: WebGLBuffer;

  private vao?: WebGLVertexArrayObject;

  private source?: string;
  private texture?: WebGLTexture;
  private paletteSize = 0;

  public async load(response: Response): Promise<void> {
    this.source = await response.text();

    this.parseModel();
  }

  public render(
    gl: WebGL2RenderingContext,
    colorProgram: TColorProgram,
    palette: TPalette,
    m: mat4,
  ) {
    if (this.positionBuffer === undefined) {
      this.createBuffers(gl);

      // Create the VAO for the vertex and color buffers
      this.createVAO(gl, colorProgram.program!, palette);
    }

    if (
      !this.vao ||
      !this.indexBuffer ||
      !this.colorBuffer ||
      !this.normalBuffer ||
      !this.texture ||
      !colorProgram.uniforms?.uPalette ||
      !colorProgram.uniforms?.uPaletteSize ||
      !colorProgram.uniforms?.uMMatrix
    ) {
      return;
    }

    gl.bindVertexArray(this.vao);

    // gl.bindTexture(gl.TEXTURE, this.texture);
    // Bind the index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(colorProgram.uniforms.uPalette, 0);

    gl.uniform1f(colorProgram.uniforms.uPaletteSize, this.paletteSize);

    // Send the m
    gl.uniformMatrix4fv(
      colorProgram.uniforms.uMMatrix,
      false,
      m as Float32Array,
    );

    const vertexCount = this.indexes.length;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;

    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  private createVAO(
    gl: WebGL2RenderingContext,
    program: TProgram,
    palette: TPalette,
  ) {
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao!);

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
      aVertexColor: {
        buffer: this.colorBuffer!,
        size: 1,
        type: gl.FLOAT,
        normalized: false,
      },
    };

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

    // Create a texture.
    const texture = gl.createTexture()!;
    this.texture = texture;

    // use texture unit 0
    gl.activeTexture(gl.TEXTURE0 + 0);

    // bind to the TEXTURE_2D bind point of texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // fill texture with 3x2 pixels
    {
      const level = 0;
      const internalFormat = gl.RGBA;
      const height = 1;
      const border = 0;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;

      const paletteData = [];
      const colors = [];

      for (const color of Object.keys(this.palette)) {
        colors[this.palette[color]] = palette[color];
      }

      this.paletteSize = colors.length;

      for (const color of colors) {
        paletteData.push(...color.map((c) => c * 255));
      }

      const data = new Uint8Array(paletteData);
      gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        colors.length,
        height,
        border,
        format,
        type,
        data,
      );
    }

    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
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

    this.colorBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.colors),
      gl.STATIC_DRAW,
    );
  }

  private parseModel() {
    const obj = OBJParser.parse(this.source!);

    this.positions = obj.vertices;
    this.normals = obj.normals;
    this.indexes = obj.indices;
    this.colors = obj.colors;
    this.palette = obj.palette;

    this.loaded = true;
  }
}
