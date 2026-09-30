import type { TJobManager } from '../../../jobs/job-manager';
import { TPostProcessingEffect } from '../effect';

export const wobbleFragmentShader = `#version 300 es
precision mediump float;

in vec2 vUV;
uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uTime;
uniform float uAmount;
out vec4 outputColor;

void main() {
  vec4 source = texture(uSource, vUV);
  outputColor = source * (1.0 - uAmount);
}
`;

export interface TFadePostProcessingOptions {
  amount?: number;
}

export class TFadePostProcessingEffect extends TPostProcessingEffect {
  private _amount = 0;

  constructor(options: TFadePostProcessingOptions = {}) {
    super();
    this._amount = options.amount ?? 0;
    this.setUniform('uAmount', this._amount);
  }

  public static async create(
    jobs: TJobManager,
    options: TFadePostProcessingOptions = {},
  ): Promise<TFadePostProcessingEffect> {
    const effect = new TFadePostProcessingEffect(options);
    await effect.loadShader(jobs, wobbleFragmentShader);
    return effect;
  }

  public get amount() {
    return this._amount;
  }

  public set amount(value: number) {
    this._amount = Math.max(0, value);
    this.setUniform('uAmount', this._amount);
  }
}
