import {
  TEngine,
  TGameState,
  TGrayscalePostProcessingEffect,
} from '@tedengine/ted';
import { createPostProcessingExampleScene } from './scene';

class GrayscaleState extends TGameState {
  public async onCreate(engine: TEngine) {
    await createPostProcessingExampleScene(this, engine);

    const grayscale = await TGrayscalePostProcessingEffect.create(this.jobs);
    this.postProcessing.add(grayscale);

    const section = engine.debugPanel.addSection('Post Processing', true);
    section.addInput(
      'Intensity',
      'range',
      '1',
      (value) => {
        grayscale.intensity = parseFloat(value);
      },
      { min: 0, max: 1, step: 0.01 },
    );
    section.addButtons('Grayscale', {
      label: 'Disable',
      onClick: (button) => {
        grayscale.enabled = !grayscale.enabled;
        button.label = grayscale.enabled ? 'Disable' : 'Enable';
      },
    });
  }
}

new TEngine(
  {
    states: { game: GrayscaleState },
    defaultState: 'game',
    debugPanelOpen: true,
  },
  self as DedicatedWorkerGlobalScope,
);
