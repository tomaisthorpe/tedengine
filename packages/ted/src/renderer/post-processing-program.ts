import type {
  TPostProcessingUniformValue,
  TSerializedPostProcessingEffect,
} from './frame-params';
import { TProgram } from './program';

const fullscreenVertexShader = `#version 300 es
precision mediump float;

out vec2 vUV;

void main() {
  vec2 position = vec2(
    (gl_VertexID == 1) ? 3.0 : -1.0,
    (gl_VertexID == 2) ? 3.0 : -1.0
  );
  vUV = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export class TPostProcessingProgram {
  public readonly program: TProgram;

  constructor(fragmentShader: string) {
    this.program = TProgram.from({
      vertexShader: fullscreenVertexShader,
      fragmentShader,
    });
  }

  public load(gl: WebGL2RenderingContext) {
    this.program.compile(gl);
    this.program.validateUniforms(['uSource']);
  }

  public render(
    gl: WebGL2RenderingContext,
    effect: TSerializedPostProcessingEffect,
    source: WebGLTexture,
    resolution: { width: number; height: number },
    time: number,
  ) {
    if (!this.program.program) throw new Error('Post-processing program not loaded');

    gl.useProgram(this.program.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, source);
    gl.uniform1i(this.program.getUniformLocation('uSource'), 0);
    gl.uniform2f(
      this.program.getUniformLocation('uResolution'),
      resolution.width,
      resolution.height,
    );
    gl.uniform1f(this.program.getUniformLocation('uTime'), time);

    for (const [name, value] of Object.entries(effect.uniforms)) {
      const location = this.program.getUniformLocation(name);
      this.setUniform(gl, location, value);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  public dispose(gl: WebGL2RenderingContext) {
    this.program.dispose(gl);
  }

  private setUniform(
    gl: WebGL2RenderingContext,
    location: WebGLUniformLocation | null,
    value: TPostProcessingUniformValue,
  ) {
    if (typeof value === 'number') {
      gl.uniform1f(location, value);
      return;
    }

    switch (value.length) {
      case 1:
        gl.uniform1fv(location, value);
        break;
      case 2:
        gl.uniform2fv(location, value);
        break;
      case 3:
        gl.uniform3fv(location, value);
        break;
      case 4:
        gl.uniform4fv(location, value);
        break;
      default:
        throw new Error(`Unsupported post-processing uniform length: ${value.length}`);
    }
  }
}
