import { TEngine, TFadePostProcessingEffect, TGameState } from '@tedengine/ted';
import { createPostProcessingExampleScene } from './scene';

class FadeState extends TGameState {
  public async onCreate(engine: TEngine) {
    await createPostProcessingExampleScene(this, engine);

    const fade = await TFadePostProcessingEffect.create(this.jobs, {
      amount: 0.5,
    });
    this.postProcessing.add(fade);

    const section = engine.debugPanel.addSection('Fade', true);
    section.addInput(
      'Amount',
      'range',
      '0.5',
      (value) => {
        fade.amount = parseFloat(value);
      },
      { min: 0, max: 1, step: 0.01 },
    );
    section.addButtons('Fade', {
      label: 'Disable',
      onClick: (button) => {
        fade.enabled = !fade.enabled;
        button.label = fade.enabled ? 'Disable' : 'Enable';
      },
    });
  }
}

new TEngine(
  {
    states: { game: FadeState },
    defaultState: 'game',
    debugPanelOpen: true,
  },
  self as DedicatedWorkerGlobalScope,
);
