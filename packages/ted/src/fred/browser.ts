export type TBrowserFeature = 'webgl2' | 'offscreencanvas';

export class TBrowser {
  public supports(feature: TBrowserFeature): boolean {
    switch (feature) {
      case 'webgl2':
        return this.supportsWebGL2();
      case 'offscreencanvas':
        return this.supportsOffscreenCanvas();
      default:
        return false;
    }
  }

  private supportsWebGL2(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('webgl2');
    } catch {
      return false;
    }
  }

  private supportsOffscreenCanvas(): boolean {
    return typeof OffscreenCanvas !== 'undefined';
  }
}
