import { mat4 } from 'gl-matrix';
import type { TPhysicsDebugProgram } from './physics-debug-program';
import type { TProgram } from './program';
import type { TAttributeBuffer } from './program';

export class TPhysicsDebug {
  private positionBuffer?: WebGLBuffer;
  private colorBuffer?: WebGLBuffer;

  private vao?: WebGLVertexArrayObject;

  private positionBufferSize = 0;
  private colorBufferSize = 0;

  public render(
    gl: WebGL2RenderingContext,
    program: TPhysicsDebugProgram,
    vertices: Float32Array,
    colors: Float32Array,
  ) {
    if (!program.program) {
      return;
    }

    if (this.positionBuffer === undefined) {
      this.createBuffers(gl);
      this.createVAO(gl, program.program);
    }

    if (!this.vao || !this.positionBuffer || !this.colorBuffer) {
      return;
    }

    gl.bindVertexArray(this.vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

    if (this.positionBufferSize < vertices.length) {
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      this.positionBufferSize = vertices.length;
    } else {
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    if (this.colorBufferSize < colors.length) {
      gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
      this.colorBufferSize = colors.length;
    } else {
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, colors);
    }

    // Base shader expects a model matrix
    // @todo: use a different base shader
    const uMMatrixLocation = program.program.getUniformLocation('uMMatrix');
    if (uMMatrixLocation !== null) {
      gl.uniformMatrix4fv(
        uMMatrixLocation,
        false,
        mat4.identity(mat4.create()) as Float32Array,
      );
    }

    gl.drawArrays(gl.LINES, 0, vertices.length / 3);
  }

  private createVAO(gl: WebGL2RenderingContext, program: TProgram) {
    const vao = gl.createVertexArray();
    if (!vao) {
      throw new Error('Failed to create vertex array object');
    }
    this.vao = vao;
    gl.bindVertexArray(this.vao);

    if (!this.positionBuffer || !this.colorBuffer) {
      throw new Error('Buffers must be created before VAO');
    }

    const buffers: { [key: string]: TAttributeBuffer } = {
      aVertexPosition: {
        buffer: this.positionBuffer,
        size: 3,
        type: gl.FLOAT,
        normalized: false,
      },
      aVertexColor: {
        buffer: this.colorBuffer,
        size: 4,
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
    const positionBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    if (!positionBuffer || !colorBuffer) {
      throw new Error('Failed to create WebGL buffers');
    }
    this.positionBuffer = positionBuffer;
    this.colorBuffer = colorBuffer;
  }
}
