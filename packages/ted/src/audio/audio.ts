import { v4 as uuidv4 } from 'uuid';

export default class TAudio {
  private ctx?: AudioContext;
  private sounds: { [key: string]: HTMLAudioElement } = {};

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
    this.sounds[uuid].volume = volume;
    this.sounds[uuid].play();
  }
}
