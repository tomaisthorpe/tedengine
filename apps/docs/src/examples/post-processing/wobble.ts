import {
  TEngine,
  TGameState,
  TWobblePostProcessingEffect,
} from '@tedengine/ted';
import { createPostProcessingExampleScene } from './scene';

class WobbleState extends TGameState {
  public async onCreate(engine: TEngine) {
    await createPostProcessingExampleScene(this, engine);

    const wobble = await TWobblePostProcessingEffect.create(this.jobs);
    this.postProcessing.add(wobble);

    const section = engine.debugPanel.addSection('Screen Wobble', true);
    section.addInput(
      'Amplitude (pixels)',
      'range',
      '6',
      (value) => {
        wobble.amplitude = parseFloat(value);
      },
      { min: 0, max: 24, step: 1 },
    );
    section.addInput(
      'Waves',
      'range',
      '3',
      (value) => {
        wobble.frequency = parseFloat(value);
      },
      { min: 0, max: 10, step: 0.5 },
    );
    section.addInput(
      'Speed',
      'range',
      '0.5',
      (value) => {
        wobble.speed = parseFloat(value);
      },
      { min: 0, max: 3, step: 0.1 },
    );
    section.addButtons('Wobble', {
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
    states: { game: WobbleState },
    defaultState: 'game',
    debugPanelOpen: true,
  },
  self as DedicatedWorkerGlobalScope,
);
