import type TPhysicsDebugProgram from './physics-debug-program';
import type TProgram from './program';

export default class TPhysicsDebug {
  private positionBuffer?: WebGLBuffer;
  private vao?: WebGLVertexArrayObject;

  private bufferSize = 0;

  public render(
    gl: WebGL2RenderingContext,
    program: TPhysicsDebugProgram,
    vertices: Float32Array,
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

    if (this.bufferSize < vertices.length) {
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    } else {
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
    }

    gl.drawArrays(gl.LINES, 0, vertices.length / 3);
  }

  private createVAO(gl: WebGL2RenderingContext, program: TProgram) {
    const { vertexPosition } = program.attribLocations;

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
  }
  private createBuffers(gl: WebGL2RenderingContext) {
    this.positionBuffer = gl.createBuffer()!;
  }
}
