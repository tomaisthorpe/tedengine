import asteroidTexture from '@assets/asteroid.png';
import { vec3 } from 'gl-matrix';
import type { TTexture } from '@tedengine/ted';
import {
  TEngine,
  TGameState,
  TOriginPoint,
  TPostProcessingEffect,
  TResourcePack,
  TSpriteComponent,
  TTextureComponent,
  TTransform,
  TTransformBundle,
  TTransformComponent,
  TVisibilityComponent,
} from '@tedengine/ted';

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
    const resources = new TResourcePack(engine, {
      textures: [asteroidTexture],
    });
    await resources.load();

    this.world.createEntity([
      TTransformBundle.with(
        new TTransformComponent(new TTransform(vec3.fromValues(0, 0, -3))),
      ),
      new TSpriteComponent({
        width: 1,
        height: 1,
        origin: TOriginPoint.Center,
      }),
      new TTextureComponent(engine.resources.get<TTexture>(asteroidTexture)!),
      new TVisibilityComponent(),
    ]);

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
