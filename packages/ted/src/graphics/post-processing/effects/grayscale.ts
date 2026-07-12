import type { TJobManager } from '../../../jobs/job-manager';
import { TPostProcessingEffect } from '../effect';

export const grayscaleFragmentShader = `#version 300 es
precision mediump float;

in vec2 vUV;
uniform sampler2D uSource;
uniform float uIntensity;
out vec4 outputColor;

void main() {
  vec4 source = texture(uSource, vUV);
  float luminance = dot(source.rgb, vec3(0.2126, 0.7152, 0.0722));
  outputColor = vec4(mix(source.rgb, vec3(luminance), uIntensity), source.a);
}
`;

export class TGrayscalePostProcessingEffect extends TPostProcessingEffect {
  private _intensity: number;

  constructor(intensity = 1) {
    super();
    this._intensity = intensity;
    this.setUniform('uIntensity', intensity);
  }

  public static async create(
    jobs: TJobManager,
    intensity = 1,
  ): Promise<TGrayscalePostProcessingEffect> {
    const effect = new TGrayscalePostProcessingEffect(intensity);
    await effect.loadShader(jobs, grayscaleFragmentShader);
    return effect;
  }

  public get intensity() {
    return this._intensity;
  }

  public set intensity(value: number) {
    this._intensity = Math.max(0, Math.min(1, value));
    this.setUniform('uIntensity', this._intensity);
  }
}
