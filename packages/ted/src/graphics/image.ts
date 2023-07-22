import type { IAsset } from '../core/resource-manager';

export default class TImage implements IAsset {
  public image?: ImageBitmap;

  public width?: number;
  public height?: number;

  /**
   * Set image is used to create a texture from an ImageBitmap.
   * For example, this is used with canvases.
   *
   * @param {ImageBitmap} image
   */
  public setImage(image: ImageBitmap, width: number, height: number) {
    this.image = image;
    this.width = width;
    this.height = height;
  }

  public async load(response: Response): Promise<void> {
    const res = await fetch(response.url);
    const blob = await res.blob();

    this.image = await createImageBitmap(blob);

    this.width = this.image.width;
    this.height = this.image.height;
  }
}
