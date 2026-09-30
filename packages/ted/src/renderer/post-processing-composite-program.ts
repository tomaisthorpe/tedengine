import type { TPostProcessingMask } from './frame-params';
import { TProgram } from './program';
import { fullscreenVertexShader } from './post-processing-program';

const compositeFragmentShader = `#version 300 es
precision mediump float;

in vec2 vUV;
uniform sampler2D uSource;
uniform sampler2D uProcessed;
uniform vec2 uResolution;
uniform int uMaskType;
uniform vec2 uCenter;
uniform vec2 uSize;
uniform float uFeather;
out vec4 outputColor;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 position = (vUV - uCenter) * vec2(aspect, 1.0);
  float distanceToEdge;

  if (uMaskType == 0) {
    distanceToEdge = length(position) - uSize.x;
  } else {
    vec2 halfSize = uSize * vec2(aspect, 1.0) * 0.5;
    vec2 corner = abs(position) - halfSize;
    distanceToEdge = length(max(corner, 0.0)) + min(max(corner.x, corner.y), 0.0);
  }

  float feather = max(uFeather, 1.0 / max(uResolution.y, 1.0));
  float coverage = 1.0 - smoothstep(-feather, 0.0, distanceToEdge);
  outputColor = mix(texture(uSource, vUV), texture(uProcessed, vUV), coverage);
}
`;

export class TPostProcessingCompositeProgram {
  private program = TProgram.from({
    vertexShader: fullscreenVertexShader,
    fragmentShader: compositeFragmentShader,
  });

  public load(gl: WebGL2RenderingContext) {
    this.program.compile(gl);
    this.program.validateUniforms(['uSource', 'uProcessed']);
  }

  public render(
    gl: WebGL2RenderingContext,
    source: WebGLTexture,
    processed: WebGLTexture,
    mask: TPostProcessingMask,
    resolution: { width: number; height: number },
  ) {
    if (!this.program.program)
      throw new Error('Post-processing composite program not loaded');

    gl.useProgram(this.program.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, source);
    gl.uniform1i(this.program.getUniformLocation('uSource'), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, processed);
    gl.uniform1i(this.program.getUniformLocation('uProcessed'), 1);
    gl.uniform2f(
      this.program.getUniformLocation('uResolution'),
      resolution.width,
      resolution.height,
    );
    gl.uniform1i(
      this.program.getUniformLocation('uMaskType'),
      mask.type === 'circle' ? 0 : 1,
    );
    gl.uniform2f(this.program.getUniformLocation('uCenter'), ...mask.center);
    if (mask.type === 'circle') {
      gl.uniform2f(this.program.getUniformLocation('uSize'), mask.radius, 0);
    } else {
      gl.uniform2f(this.program.getUniformLocation('uSize'), ...mask.size);
    }
    gl.uniform1f(
      this.program.getUniformLocation('uFeather'),
      Math.max(0, mask.feather ?? 0),
    );
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  public dispose(gl: WebGL2RenderingContext) {
    this.program.dispose(gl);
  }
}
