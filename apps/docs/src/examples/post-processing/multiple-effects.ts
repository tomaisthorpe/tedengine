import {
  TEngine,
  TFilmGrainPostProcessingEffect,
  TGameState,
  TGrayscalePostProcessingEffect,
} from '@tedengine/ted';
import { createPostProcessingExampleScene } from './scene';

class MultipleEffectsState extends TGameState {
  public async onCreate(engine: TEngine) {
    await createPostProcessingExampleScene(this, engine);

    const grayscale = await TGrayscalePostProcessingEffect.create(this.jobs);
    const filmGrain = await TFilmGrainPostProcessingEffect.create(this.jobs, {
      amount: 0.06,
      grainSize: 1,
      speed: 1,
    });

    this.postProcessing.add(grayscale);
    this.postProcessing.add(filmGrain);

    const grayscaleSection = engine.debugPanel.addSection('Grayscale', true);
    grayscaleSection.addInput(
      'Intensity',
      'range',
      '1',
      (value) => {
        grayscale.intensity = parseFloat(value);
      },
      { min: 0, max: 1, step: 0.01 },
    );
    grayscaleSection.addButtons('Grayscale', {
      label: 'Disable',
      onClick: (button) => {
        grayscale.enabled = !grayscale.enabled;
        button.label = grayscale.enabled ? 'Disable' : 'Enable';
      },
    });

    const grainSection = engine.debugPanel.addSection('Film Grain', true);
    grainSection.addInput(
      'Grain amount',
      'range',
      '0.06',
      (value) => {
        filmGrain.amount = parseFloat(value);
      },
      { min: 0, max: 0.5, step: 0.01 },
    );
    grainSection.addInput(
      'Grain size',
      'range',
      '1',
      (value) => {
        filmGrain.grainSize = parseFloat(value);
      },
      { min: 1, max: 8, step: 1 },
    );
    grainSection.addInput(
      'Speed',
      'range',
      '1',
      (value) => {
        filmGrain.speed = parseFloat(value);
      },
      { min: 0, max: 2, step: 0.1 },
    );
    grainSection.addButtons('Film grain', {
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
    states: { game: MultipleEffectsState },
    defaultState: 'game',
    debugPanelOpen: true,
  },
  self as DedicatedWorkerGlobalScope,
);
