import asteroidTexture from '@assets/asteroid.png';
import { vec3 } from 'gl-matrix';
import type { TTexture } from '@tedengine/ted';
import {
  TEngine,
  TGameState,
  TGrayscalePostProcessingEffect,
  TOriginPoint,
  TResourcePack,
  TSpriteComponent,
  TTextureComponent,
  TTransform,
  TTransformBundle,
  TTransformComponent,
  TVisibilityComponent,
} from '@tedengine/ted';

class GrayscaleState extends TGameState {
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
