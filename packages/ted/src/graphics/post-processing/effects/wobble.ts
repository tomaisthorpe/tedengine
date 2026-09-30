import type { TJobManager } from '../../../jobs/job-manager';
import { TPostProcessingEffect } from '../effect';

export const wobbleFragmentShader = `#version 300 es
precision mediump float;

in vec2 vUV;
uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uSpeed;
out vec4 outputColor;

void main() {
  float phase = (vUV.y * uFrequency + uTime * uSpeed) * 6.2831853;
  float offset = sin(phase) * uAmplitude / max(uResolution.x, 1.0);
  outputColor = texture(uSource, vec2(vUV.x + offset, vUV.y));
}
`;

export interface TWobblePostProcessingOptions {
  /** Maximum horizontal displacement in screen pixels. */
  amplitude?: number;
  /** Number of waves across the screen height. */
  frequency?: number;
  /** Wave cycles per second. */
  speed?: number;
}

export class TWobblePostProcessingEffect extends TPostProcessingEffect {
  private _amplitude = 6;
  private _frequency = 3;
  private _speed = 0.5;

  constructor(options: TWobblePostProcessingOptions = {}) {
    super();
    this.amplitude = options.amplitude ?? 6;
    this.frequency = options.frequency ?? 3;
    this.speed = options.speed ?? 0.5;
  }

  public static async create(
    jobs: TJobManager,
    options: TWobblePostProcessingOptions = {},
  ): Promise<TWobblePostProcessingEffect> {
    const effect = new TWobblePostProcessingEffect(options);
    await effect.loadShader(jobs, wobbleFragmentShader);
    return effect;
  }

  public get amplitude() {
    return this._amplitude;
  }

  public set amplitude(value: number) {
    this._amplitude = Math.max(0, value);
    this.setUniform('uAmplitude', this._amplitude);
  }

  public get frequency() {
    return this._frequency;
  }

  public set frequency(value: number) {
    this._frequency = Math.max(0, value);
    this.setUniform('uFrequency', this._frequency);
  }

  public get speed() {
    return this._speed;
  }

  public set speed(value: number) {
    this._speed = Math.max(0, value);
    this.setUniform('uSpeed', this._speed);
  }
}
