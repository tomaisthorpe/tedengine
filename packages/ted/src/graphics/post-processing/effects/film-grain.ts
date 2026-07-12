import type { TJobManager } from '../../../jobs/job-manager';
import { TPostProcessingEffect } from '../effect';

export const filmGrainFragmentShader = `#version 300 es
precision highp float;
precision highp int;

in vec2 vUV;
uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uTime;
uniform float uAmount;
uniform float uGrainSize;
uniform float uSpeed;
out vec4 outputColor;

uint hash(uint value) {
  uint state = value * 747796405u + 2891336453u;
  uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
  return (word >> 22u) ^ word;
}

void main() {
  vec4 source = texture(uSource, vUV);
  uvec2 pixel = uvec2(floor(gl_FragCoord.xy / uGrainSize));
  uint frame = uint(floor(uTime * uSpeed * 60.0));
  uint seed = pixel.x * 1973u + pixel.y * 9277u + frame * 26699u;
  float grain = float(hash(seed)) / 4294967295.0 - 0.5;
  outputColor = vec4(source.rgb + grain * uAmount, source.a);
}
`;

export interface TFilmGrainPostProcessingOptions {
  amount?: number;
  grainSize?: number;
  speed?: number;
}

export class TFilmGrainPostProcessingEffect extends TPostProcessingEffect {
  private _amount = 0.06;
  private _grainSize = 1;
  private _speed = 1;

  constructor(options: TFilmGrainPostProcessingOptions = {}) {
    super();
    this.amount = options.amount ?? 0.06;
    this.grainSize = options.grainSize ?? 1;
    this.speed = options.speed ?? 1;
  }

  public static async create(
    jobs: TJobManager,
    options: TFilmGrainPostProcessingOptions = {},
  ): Promise<TFilmGrainPostProcessingEffect> {
    const effect = new TFilmGrainPostProcessingEffect(options);
    await effect.loadShader(jobs, filmGrainFragmentShader);
    return effect;
  }

  public get amount() {
    return this._amount;
  }

  public set amount(value: number) {
    this._amount = Math.max(0, Math.min(1, value));
    this.setUniform('uAmount', this._amount);
  }

  public get grainSize() {
    return this._grainSize;
  }

  public set grainSize(value: number) {
    this._grainSize = Math.max(1, value);
    this.setUniform('uGrainSize', this._grainSize);
  }

  public get speed() {
    return this._speed;
  }

  public set speed(value: number) {
    this._speed = Math.max(0, value);
    this.setUniform('uSpeed', this._speed);
  }
}
