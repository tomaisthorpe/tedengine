import { TImage } from '..';
import type { IJobAsset } from '../core/resource-manager';
import type TJobManager from '../jobs/job-manager';

/**
 * Filter = Nearest | Linear
 */
export enum TTextureFilter {
  Nearest = 0x2600,
  Linear = 0x2601,
}

export default class TTexture implements IJobAsset {
  public uuid?: string;
  // @todo make this functional
  public filter: TTextureFilter = TTextureFilter.Linear;

  public async loadWithJob(jobs: TJobManager, url: string): Promise<void> {
    // First load the image    // @todo this is too brittle, this may not be set
    const image = await jobs.additionalContext.resourceManager.load<TImage>(
      TImage,
      url
    );

    const result = await jobs.do(
      {
        type: 'load_texture_from_imagebitmap',
        args: [image.image],
      },
      [image.image!]
    );

    this.uuid = result;
  }

  public async setImageBitmap(jobs: TJobManager, image: ImageBitmap) {
    const result = await jobs.do(
      {
        type: 'load_texture_from_imagebitmap',
        args: [image],
      },
      [image]
    );

    this.uuid = result;
  }
}
