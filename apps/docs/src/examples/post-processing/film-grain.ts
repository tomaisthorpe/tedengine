import asteroidTexture from '@assets/asteroid.png';
import { vec3 } from 'gl-matrix';
import type { TTexture } from '@tedengine/ted';
import {
  TEngine,
  TFilmGrainPostProcessingEffect,
  TGameState,
  TOriginPoint,
  TResourcePack,
  TSpriteComponent,
  TTextureComponent,
  TTransform,
  TTransformBundle,
  TTransformComponent,
  TVisibilityComponent,
} from '@tedengine/ted';

class FilmGrainState extends TGameState {
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
