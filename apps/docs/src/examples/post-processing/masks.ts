import {
  TEngine,
  TGameState,
  TGrayscalePostProcessingEffect,
  TWobblePostProcessingEffect,
} from '@tedengine/ted';
import { createPostProcessingExampleScene } from './scene';

class MasksState extends TGameState {
  public async onCreate(engine: TEngine) {
    await createPostProcessingExampleScene(this, engine);

    const grayscale = await TGrayscalePostProcessingEffect.create(this.jobs);
    grayscale.mask = {
      type: 'circle',
      center: [0.38, 0.5],
      radius: 0.32,
      feather: 0.06,
    };

    const wobble = await TWobblePostProcessingEffect.create(this.jobs, {
      amplitude: 12,
      frequency: 3,
      speed: 0.5,
    });
    wobble.mask = {
      type: 'rectangle',
      center: [0.65, 0.5],
      size: [0.45, 0.7],
      feather: 0.06,
    };

    this.postProcessing.add(grayscale);
    this.postProcessing.add(wobble);

    const grayscaleSection = engine.debugPanel.addSection(
      'Circle: Grayscale',
      true,
    );
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

    const wobbleSection = engine.debugPanel.addSection(
      'Rectangle: Wobble',
      true,
    );
    wobbleSection.addInput(
      'Amplitude (pixels)',
      'range',
      '12',
      (value) => {
        wobble.amplitude = parseFloat(value);
      },
      { min: 0, max: 24, step: 1 },
    );
    wobbleSection.addButtons('Wobble', {
      label: 'Disable',
      onClick: (button) => {
        wobble.enabled = !wobble.enabled;
        button.label = wobble.enabled ? 'Disable' : 'Enable';
      },
    });
  }
}

new TEngine(
  {
    states: { game: MasksState },
    defaultState: 'game',
    debugPanelOpen: true,
  },
  self as DedicatedWorkerGlobalScope,
);
