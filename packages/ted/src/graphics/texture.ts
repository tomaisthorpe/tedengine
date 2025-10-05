import type { TTextureOptions } from '../renderer/renderable-texture';
import { TTextureFilter, TTextureWrap } from '../renderer/renderable-texture';
import TImage from './image';
import type { IJobAsset } from '../core/resource-manager';
import type TJobManager from '../jobs/job-manager';
import type {
  TAudioJobContext,
  TJobContext,
  TPhysicsJobContext,
  TRenderJobContext,
  TGameStateJobContext,
} from '../jobs/jobs';
import { RendererJobLoadTextureFromImageBitmap } from '../renderer/jobs';

function hasResourceManager(
  additionalContext:
    | TJobContext
    | TRenderJobContext
    | TAudioJobContext
    | TPhysicsJobContext
    | TGameStateJobContext,
): additionalContext is TJobContext | TRenderJobContext | TAudioJobContext {
  return (additionalContext as TJobContext).resourceManager !== undefined;
}

export default class TTexture implements IJobAsset {
  public uuid?: string;

  private _filter: TTextureFilter = TTextureFilter.Linear;
  private _wrapS: TTextureWrap = TTextureWrap.Repeat;
  private _wrapT: TTextureWrap = TTextureWrap.Repeat;

  /**
   * Returns the filter used for the texture, this cannot be changed after texture is loaded
   */
  public get filter(): TTextureFilter {
    return this._filter;
  }

  /**
   * Returns the wrap mode for the S coordinate, this cannot be changed after texture is loaded
   */
  public get wrapS(): TTextureWrap {
    return this._wrapS;
  }

  /**
   * Returns the wrap mode for the T coordinate, this cannot be changed after texture is loaded
   */
  public get wrapT(): TTextureWrap {
    return this._wrapT;
  }

  public async loadWithJob(
    jobs: TJobManager,
    url: string,
    config?: TTextureOptions,
  ): Promise<void> {
    if (!hasResourceManager(jobs.additionalContext)) {
      throw new Error('job manager does not have resource manager');
    }

    if (config?.filter !== undefined) {
      this._filter = config.filter;
    }

    if (config?.wrapS !== undefined) {
      this._wrapS = config.wrapS;
    }

    if (config?.wrapT !== undefined) {
      this._wrapT = config.wrapT;
    }

    // First load the image
    const image = await jobs.additionalContext.resourceManager.load<TImage>(
      TImage,
      url,
    );

    if (!image.image) {
      throw new Error('image not loaded');
    }

    const result = await jobs.do(RendererJobLoadTextureFromImageBitmap, {
      image: image.image,
      config: {
        filter: this.filter,
        wrapS: this.wrapS,
        wrapT: this.wrapT,
      },
    });

    this.uuid = result;
  }

  public async setImageBitmap(
    jobs: TJobManager,
    image: ImageBitmap,
    options?: TTextureOptions,
  ): Promise<void> {
    if (options?.filter !== undefined) {
      this._filter = options.filter;
    }

    if (options?.wrapS !== undefined) {
      this._wrapS = options.wrapS;
    }

    if (options?.wrapT !== undefined) {
      this._wrapT = options.wrapT;
    }

    const result = await jobs.do(RendererJobLoadTextureFromImageBitmap, {
      image: image,
      config: {
        filter: this.filter,
        wrapS: this.wrapS,
        wrapT: this.wrapT,
      },
    });

    this.uuid = result;
  }
}
