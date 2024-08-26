import type TPhysicsDebugProgram from './physics-debug-program';
import type TProgram from './program';

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

    if (!this.vao) {
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

    gl.drawArrays(gl.LINES, 0, vertices.length / 3);
  }

  private createVAO(gl: WebGL2RenderingContext, program: TProgram) {
    const { vertexPosition, colorPosition } = program.attribLocations;

    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao!);

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

    // Colors buffer
    {
      const numComponents = 4;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer!);
      gl.vertexAttribPointer(
        colorPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset,
      );

      gl.enableVertexAttribArray(colorPosition);
    }
  }
  private createBuffers(gl: WebGL2RenderingContext) {
    this.positionBuffer = gl.createBuffer()!;
    this.colorBuffer = gl.createBuffer()!;
  }
}
