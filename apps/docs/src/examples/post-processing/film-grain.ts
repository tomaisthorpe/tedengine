import {
  TEngine,
  TFilmGrainPostProcessingEffect,
  TGameState,
} from '@tedengine/ted';
import { createPostProcessingExampleScene } from './scene';

class FilmGrainState extends TGameState {
  public async onCreate(engine: TEngine) {
    await createPostProcessingExampleScene(this, engine);

    const filmGrain = await TFilmGrainPostProcessingEffect.create(this.jobs);
    this.postProcessing.add(filmGrain);

    const section = engine.debugPanel.addSection('Film Grain', true);
    section.addInput(
      'Grain amount',
      'range',
      '0.06',
      (value) => {
        filmGrain.amount = parseFloat(value);
      },
      { min: 0, max: 0.5, step: 0.01 },
    );
    section.addInput(
      'Grain size',
      'range',
      '1',
      (value) => {
        filmGrain.grainSize = parseFloat(value);
      },
      { min: 1, max: 8, step: 1 },
    );
    section.addInput(
      'Speed',
      'range',
      '1',
      (value) => {
        filmGrain.speed = parseFloat(value);
      },
      { min: 0, max: 2, step: 0.1 },
    );
    section.addButtons('Film grain', {
      label: 'Disable',
      onClick: (button) => {
        filmGrain.enabled = !filmGrain.enabled;
        button.label = filmGrain.enabled ? 'Disable' : 'Enable';
      },
    });
  }
}

new TEngine(
  {
    states: { game: FilmGrainState },
    defaultState: 'game',
    debugPanelOpen: true,
  },
  self as DedicatedWorkerGlobalScope,
);
