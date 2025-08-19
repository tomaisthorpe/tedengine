import { mat4 } from 'gl-matrix';
import type TPhysicsDebugProgram from './physics-debug-program';
import type TProgram from './program';
import type { TAttributeBuffer } from './program';

export default class TPhysicsDebug {
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
    if (this.positionBuffer === undefined) {
      this.createBuffers(gl);
      this.createVAO(gl, program.program!);
    }

    if (!this.vao || !program.program) {
      return;
    }

    gl.bindVertexArray(this.vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer!);

    if (this.positionBufferSize < vertices.length) {
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      this.positionBufferSize = vertices.length;
    } else {
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer!);
    if (this.colorBufferSize < colors.length) {
      gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
      this.colorBufferSize = colors.length;
    } else {
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, colors);
    }

    // Base shader expects a model matrix
    // @todo: use a different base shader
    gl.uniformMatrix4fv(
      program.program.getUniformLocation('uMMatrix')!,
      false,
      mat4.identity(mat4.create()) as Float32Array,
    );

    gl.drawArrays(gl.LINES, 0, vertices.length / 3);
  }

  private createVAO(gl: WebGL2RenderingContext, program: TProgram) {
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao!);

    const buffers: { [key: string]: TAttributeBuffer } = {
      aVertexPosition: {
        buffer: this.positionBuffer!,
        size: 3,
        type: gl.FLOAT,
        normalized: false,
      },
      aVertexColor: {
        buffer: this.colorBuffer!,
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
    this.positionBuffer = gl.createBuffer()!;
    this.colorBuffer = gl.createBuffer()!;
  }
}
