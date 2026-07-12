import {
  TEngine,
  TGameState,
  TPostProcessingEffect,
} from '@tedengine/ted';
import { createPostProcessingExampleScene } from './scene';

const invertFragmentShader = `#version 300 es
precision mediump float;

in vec2 vUV;
uniform sampler2D uSource;
uniform float uAmount;
out vec4 outputColor;

void main() {
  vec4 source = texture(uSource, vUV);
  vec3 inverted = vec3(1.0) - source.rgb;
  outputColor = vec4(mix(source.rgb, inverted, uAmount), source.a);
}
`;

class CustomEffectState extends TGameState {
  public async onCreate(engine: TEngine) {
    await createPostProcessingExampleScene(this, engine);

    const invert = await TPostProcessingEffect.fromSource(
      this.jobs,
      invertFragmentShader,
    );
    invert.setUniform('uAmount', 1);
    this.postProcessing.add(invert);

    const section = engine.debugPanel.addSection('Custom Effect', true);
    section.addInput(
      'Amount',
      'range',
      '1',
      (value) => {
        invert.setUniform('uAmount', parseFloat(value));
      },
      { min: 0, max: 1, step: 0.01 },
    );
    section.addButtons('Invert', {
      label: 'Disable',
      onClick: (button) => {
        invert.enabled = !invert.enabled;
        button.label = invert.enabled ? 'Disable' : 'Enable';
      },
    });
  }
}

new TEngine(
  {
    states: { game: CustomEffectState },
    defaultState: 'game',
    debugPanelOpen: true,
  },
  self as DedicatedWorkerGlobalScope,
);
