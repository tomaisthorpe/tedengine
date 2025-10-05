import sound from '@assets/sound.wav';
import type { TSound } from '@tedengine/ted';
import { TGameState, TResourcePack, TEngine } from '@tedengine/ted';

class ExampleState extends TGameState {
  public async onCreate(engine: TEngine) {
    const rp = new TResourcePack(engine, {
      sounds: [sound],
    });

    await rp.load();

    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const clip = engine.resources.get<TSound>(sound);
    if (!clip) {
      return;
    }

    clip.volume = 0.3;

    const section = engine.debugPanel.addSection('Audio', true);
    section.addButtons('Play Audio', {
      label: 'Play Once',
      onClick: () => {
        clip.loop = false;
        clip.play();
      },
    });

    section.addButtons('Loop Audio', {
      label: 'Play Looping',
      onClick: () => {
        clip.loop = true;
        clip.play();
      },
    });

    section.addInput(
      'Volume',
      'range',
      '0.7',
      (value: string) => {
        clip.setVolume(parseFloat(value));
      },
      { max: 1, min: 0, step: 0.1 },
    );
  }
}

const config = {
  states: {
    game: ExampleState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
