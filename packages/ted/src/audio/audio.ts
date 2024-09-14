import { v4 as uuidv4 } from 'uuid';

export default class TAudio {
  private ctx?: AudioContext;
  private sounds: { [key: string]: HTMLAudioElement } = {};

  private _muted = false;

  public get muted() {
    return this._muted;
  }

  public set muted(value: boolean) {
    this._muted = value;

    // Loop through all sounds and set the muted property
    Object.values(this.sounds).forEach((sound) => {
      sound.muted = value;
    });
  }

  /**
   * Gets the AudioContext. You must do this AFTER the user has interacted with
   * page. Otherwise Chrome will block the context.
   *
   * @returns {AudioContext} ctx
   */
  public getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }

    return this.ctx;
  }

  public async loadSound(url: string): Promise<string> {
    const uuid = uuidv4();

    this.sounds[uuid] = new Audio(url);
    return uuid;
  }

  public play(uuid: string, volume: number) {
    if (this.muted) return;

    this.sounds[uuid].volume = volume;
    this.sounds[uuid].play();
  }
}
