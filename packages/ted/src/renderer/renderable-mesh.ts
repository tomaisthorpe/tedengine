// @todo this file is missing a lot of error handling
import type { mat4 } from 'gl-matrix';
import { v4 as uuidv4 } from 'uuid';
import type { IAsset } from '../core/resource-manager';
import type { TPalette } from '../graphics/color-material';
import { OBJParser } from '../utils/obj-parser';
import type { TColorProgram } from './color-program';
import type { TProgram } from './program';
import type { TAttributeBuffer } from './program';

export interface TPaletteIndex {
  [key: string]: number;
}

export class TRenderableMesh implements IAsset {
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
  private cachedPalette?: TPalette;

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
    if (!colorProgram.program) {
      return; // Can't render without a compiled program
    }

    if (this.positionBuffer === undefined) {
      this.createBuffers(gl);

      // Create the VAO for the vertex and color buffers
      this.createVAO(gl, colorProgram.program, palette);
    }

    // Check if palette has changed and update texture if needed
    if (this.hasPaletteChanged(palette)) {
      this.updatePaletteTexture(gl, palette);
    }

    if (
      !this.vao ||
      !this.indexBuffer ||
      !this.colorBuffer ||
      !this.normalBuffer ||
      !this.texture ||
      !colorProgram.uniforms?.uPalette ||
      !colorProgram.uniforms.uPaletteSize ||
      !colorProgram.uniforms.uMMatrix
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
    if (!this.positionBuffer || !this.normalBuffer || !this.colorBuffer) {
      throw new Error('Buffers must be created before VAO');
    }

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    const buffers: { [key: string]: TAttributeBuffer | undefined } = {
      aVertexPosition: {
        buffer: this.positionBuffer,
        size: 3,
        type: gl.FLOAT,
        normalized: false,
      },
      aVertexNormal: {
        buffer: this.normalBuffer,
        size: 3,
        type: gl.FLOAT,
        normalized: false,
      },
      aVertexColor: {
        buffer: this.colorBuffer,
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
    const texture = gl.createTexture();
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
        const pcolor = palette[color];
        if (pcolor) {
          colors[this.palette[color]] = pcolor;
        }
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

    // Cache the initial palette
    this.cachedPalette = JSON.parse(JSON.stringify(palette));
  }

  /**
   * Creates the buffers and transfers the data
   */
  private createBuffers(gl: WebGL2RenderingContext): void {
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.positions),
      gl.STATIC_DRAW,
    );

    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.normals),
      gl.STATIC_DRAW,
    );

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.indexes),
      gl.STATIC_DRAW,
    );

    this.colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.colors),
      gl.STATIC_DRAW,
    );
  }

  private parseModel() {
    if (!this.source) {
      throw new Error('Cannot parse model: source is not loaded');
    }
    const obj = OBJParser.parse(this.source);

    this.positions = obj.vertices;
    this.normals = obj.normals;
    this.indexes = obj.indices;
    this.colors = obj.colors;
    this.palette = obj.palette;

    this.loaded = true;
  }

  /**
   * Check if the palette has changed since the last render
   */
  private hasPaletteChanged(palette: TPalette): boolean {
    if (!this.cachedPalette) {
      return false; // First render, palette will be set in createVAO
    }

    // Compare each color in the palette
    for (const key of Object.keys(this.palette)) {
      const cachedColor = this.cachedPalette[key];
      const newColor = palette[key];

      if (!cachedColor || !newColor) {
        return true;
      }

      // Compare RGBA values
      for (let i = 0; i < 4; i++) {
        if (cachedColor[i] !== newColor[i]) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Update the palette texture with new colors
   */
  private updatePaletteTexture(
    gl: WebGL2RenderingContext,
    palette: TPalette,
  ): void {
    if (!this.texture) {
      return;
    }

    // Build the new palette data
    const paletteData = [];
    const colors = [];

    for (const color of Object.keys(this.palette)) {
      const pcolor = palette[color];
      if (pcolor) {
        colors[this.palette[color]] = pcolor;
      }
    }

    this.paletteSize = colors.length;

    for (const color of colors) {
      paletteData.push(...color.map((c) => c * 255));
    }

    const data = new Uint8Array(paletteData);

    // Update the existing texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      colors.length,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      data,
    );

    // Cache the new palette
    this.cachedPalette = JSON.parse(JSON.stringify(palette));
  }
}
