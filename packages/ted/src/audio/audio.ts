import { v4 as uuidv4 } from 'uuid';
import { Howl } from 'howler';

export default class TAudio {
  private sounds: { [key: string]: Howl } = {};

  private _muted = false;

  public get muted() {
    return this._muted;
  }

  public set muted(value: boolean) {
    this._muted = value;

    // Loop through all sounds and set the muted property
    Object.values(this.sounds).forEach((sound) => {
      sound.mute(value);
    });
  }

  public async loadSound(url: string): Promise<string> {
    const uuid = uuidv4();

    this.sounds[uuid] = new Howl({ src: [url] });
    return uuid;
  }

  public play(uuid: string, volume: number) {
    this.sounds[uuid].volume(volume);
    this.sounds[uuid].play();
  }
}
