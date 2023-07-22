import sound from '@assets/sound.wav';
import {
  TGameState,
  TActor,
  TResourcePackConfig,
  TResourcePack,
  TSound,
  TEngine,
} from '@tedengine/ted';

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

const engine = new TEngine(config, postMessage.bind(self));
onmessage = engine.onMessage;
