import sound from '@assets/sound.wav';
import type { TResourcePackConfig, TSound } from '@tedengine/ted';
import { TGameState, TActor, TResourcePack, TEngine } from '@tedengine/ted';

class Actor extends TActor {
  public static resources: TResourcePackConfig = {
    sounds: [sound],
  };

  constructor(private engine: TEngine) {
    super();

    const clip = engine.resources.get<TSound>(sound);

    const section = engine.debugPanel.addSection('Audio', true);
    section.addButtons('Play Audio', {
      label: 'Play Once',
      onClick: () => clip.play(),
    });
  }
}

class ExampleState extends TGameState {
  public async onCreate(engine: TEngine) {
    const rp = new TResourcePack(engine, Actor.resources);

    await rp.load();

    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const example = new Actor(engine);
    this.addActor(example);
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
