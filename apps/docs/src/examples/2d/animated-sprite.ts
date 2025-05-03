import personTexture from '@assets/person.png';
import { vec3 } from 'gl-matrix';
import type { TTexture } from '@tedengine/ted';
import {
  TGameState,
  TOriginPoint,
  TResourcePack,
  TEngine,
  TAnimatedSpriteComponent,
  TSpriteLayer,
  TTextureFilter,
  TSpriteComponent,
  TTransformComponent,
  TTransform,
  TTextureComponent,
  TVisibilityComponent,
  TCameraComponent,
  TProjectionType,
  TActiveCameraComponent,
} from '@tedengine/ted';

class SpriteState extends TGameState {
  public async onCreate(engine: TEngine) {
    const rp = new TResourcePack(engine, {
      textures: [
        {
          url: personTexture,
          config: {
            filter: TTextureFilter.Nearest,
          },
        },
      ],
    });
    await rp.load();

    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const sprite = new TSpriteComponent({
      width: 12 * 4,
      height: 24 * 4,
      origin: TOriginPoint.Center,
      layer: TSpriteLayer.Foreground_0,
    });

    const animatedSprite = new TAnimatedSpriteComponent(10, 9);

    this.world.createEntity([
      new TTransformComponent(
        new TTransform(
          vec3.fromValues(0, 0, -3),
          undefined,
          vec3.fromValues(1, 1, 1),
        ),
      ),
      sprite,
      animatedSprite,
      new TTextureComponent(engine.resources.get<TTexture>(personTexture)!),
      new TVisibilityComponent(),
    ]);

    this.world.createEntity([
      new TCameraComponent({
        type: TProjectionType.Orthographic,
      }),
      new TTransformComponent(new TTransform()),
      new TActiveCameraComponent(),
    ]);

    const filterSection = engine.debugPanel.addSection('Color Filter', true);
    filterSection.addInput(
      'Red',
      'range',
      '1',
      (value) => {
        sprite.colorFilter[0] = parseFloat(value);
      },
      {
        min: 0,
        max: 1,
        step: 0.01,
      },
    );
    filterSection.addInput(
      'Green',
      'range',
      '1',
      (value) => {
        sprite.colorFilter[1] = parseFloat(value);
      },
      {
        min: 0,
        max: 1,
        step: 0.01,
      },
    );
    filterSection.addInput(
      'Blue',
      'range',
      '1',
      (value) => {
        sprite.colorFilter[2] = parseFloat(value);
      },
      {
        min: 0,
        max: 1,
        step: 0.01,
      },
    );
    filterSection.addInput(
      'Alpha',
      'range',
      '1',
      (value) => {
        sprite.colorFilter[3] = parseFloat(value);
      },
      {
        min: 0,
        max: 1,
        step: 0.01,
      },
    );

    const section = engine.debugPanel.addSection('Animation', true);
    section.addButtons('Toggle Animation', {
      label: 'Toggle',
      onClick: () => {
        animatedSprite.paused = !animatedSprite.paused;
      },
    });
  }
}

const config = {
  states: {
    game: SpriteState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
