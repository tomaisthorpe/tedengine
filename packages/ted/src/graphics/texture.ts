import type { TTextureOptions } from '../renderer/renderable-texture';
import { TTextureFilter } from '../renderer/renderable-texture';
import TImage from './image';
import type { IJobAsset } from '../core/resource-manager';
import type TJobManager from '../jobs/job-manager';
import type {
  TAudioJobContext,
  TJobContext,
  TPhysicsJobContext,
  TRenderJobContext,
} from '../jobs/jobs';

function hasResourceManager(
  additionalContext:
    | TJobContext
    | TRenderJobContext
    | TAudioJobContext
    | TPhysicsJobContext,
): additionalContext is TJobContext | TRenderJobContext | TAudioJobContext {
  return (additionalContext as TJobContext).resourceManager !== undefined;
}

export default class TTexture implements IJobAsset {
  public uuid?: string;

  private _filter: TTextureFilter = TTextureFilter.Linear;

  /**
   * Returns the filter used for the texture, this cannot be changed after texture is loaded
   */
  public get filter(): TTextureFilter {
    return this._filter;
  }

  // @todo - add support for setting the filter
  public async loadWithJob(jobs: TJobManager, url: string): Promise<void> {
    if (!hasResourceManager(jobs.additionalContext)) {
      throw new Error('job manager does not have resource manager');
    }

    // First load the image
    const image = await jobs.additionalContext.resourceManager.load<TImage>(
      TImage,
      url,
    );

    if (!image.image) {
      throw new Error('image not loaded');
    }

    const result = await jobs.do<string>(
      {
        type: 'load_texture_from_imagebitmap',
        args: [image.image, { filter: this.filter }],
      },
      [image.image],
    );

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

    const result = await jobs.do<string>(
      {
        type: 'load_texture_from_imagebitmap',
        args: [image, options],
      },
      [image],
    );

    this.uuid = result;
  }
}
