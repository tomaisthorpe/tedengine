import type { TJobManager } from '../../jobs/job-manager';
import type {
  TPostProcessingUniformValue,
  TSerializedPostProcessingEffect,
} from '../../renderer/frame-params';
import {
  RendererJobDisposePostProcessingProgram,
  RendererJobLoadPostProcessingProgram,
} from '../../renderer/jobs';

export class TPostProcessingEffect {
  public enabled = true;
  protected uuid?: string;
  protected uniforms: Record<string, TPostProcessingUniformValue> = {};

  protected async loadShader(jobs: TJobManager, fragmentShader: string) {
    this.uuid = await jobs.do(RendererJobLoadPostProcessingProgram, {
      fragmentShader,
    });
  }

  public static async fromSource(
    jobs: TJobManager,
    fragmentShader: string,
  ): Promise<TPostProcessingEffect> {
    const effect = new TPostProcessingEffect();
    await effect.loadShader(jobs, fragmentShader);
    return effect;
  }

  public static async fromUrl(
    jobs: TJobManager,
    url: string,
  ): Promise<TPostProcessingEffect> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to load post-processing shader: ${response.statusText}`,
      );
    }
    return TPostProcessingEffect.fromSource(jobs, await response.text());
  }

  public setUniform(name: string, value: TPostProcessingUniformValue) {
    this.uniforms[name] = value;
  }

  public async destroy(jobs: TJobManager) {
    if (!this.uuid) return;
    await jobs.do(RendererJobDisposePostProcessingProgram, { uuid: this.uuid });
    this.uuid = undefined;
  }

  public serialise(): TSerializedPostProcessingEffect | undefined {
    if (!this.enabled || !this.uuid) return undefined;
    return { uuid: this.uuid, uniforms: { ...this.uniforms } };
  }
}
