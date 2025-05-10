import trainLocoMesh from '@assets/train-electric-city-a.obj';
import trainPantoMesh from '@assets/train-electric-city-b.obj';
import trainMiddleMesh from '@assets/train-electric-city-c.obj';
import trainTexture from '@assets/kenney-colormap.png';
import { quat, vec3 } from 'gl-matrix';
import type { TTexture } from '@tedengine/ted';
import {
  TGameState,
  TResourcePack,
  TTexturedMeshComponent,
  TEngine,
  TTransformComponent,
  TTransform,
  TTextureComponent,
  TVisibilityComponent,
  TParentEntityComponent,
  TTransformBundle,
  TMaterialComponent,
} from '@tedengine/ted';
import { TRotatingComponent, TRotatingSystem } from '../shared/rotating';

class TrainState extends TGameState {
  public async onCreate(engine: TEngine) {
    const rp = new TResourcePack(engine, {
      texturedMeshes: [trainLocoMesh, trainPantoMesh, trainMiddleMesh],
      textures: [trainTexture],
    });

    await rp.load();

    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    this.world.addSystem(new TRotatingSystem(this.world));

    const rotatingComponent = new TRotatingComponent(
      vec3.fromValues(0, 0.5, 0),
    );

    const train = this.world.createEntity([
      TTransformBundle.with(
        new TTransformComponent(new TTransform(vec3.fromValues(0, 0, -1))),
      ),
      rotatingComponent,
    ]);

    const start = this.world.createEntity([
      TTransformBundle.with(
        new TTransformComponent(
          new TTransform(undefined, undefined, vec3.fromValues(0.1, 0.1, 0.1)),
        ),
      ),
      new TParentEntityComponent(train),
      new TTexturedMeshComponent({ source: 'path', path: trainLocoMesh }),
      new TTextureComponent(engine.resources.get<TTexture>(trainTexture)!),
      new TVisibilityComponent(),
    ]);

    const panto = this.world.createEntity([
      TTransformBundle.with(
        new TTransformComponent(
          new TTransform(
            vec3.fromValues(0, 0, -0.24),
            undefined,
            vec3.fromValues(0.1, 0.1, 0.1),
          ),
        ),
      ),
      new TParentEntityComponent(train),
      new TTexturedMeshComponent({ source: 'path', path: trainPantoMesh }),
      new TTextureComponent(engine.resources.get<TTexture>(trainTexture)!),
      new TVisibilityComponent(),
    ]);

    const middle = this.world.createEntity([
      TTransformBundle.with(
        new TTransformComponent(
          new TTransform(
            vec3.fromValues(0, 0, -0.495),
            undefined,
            vec3.fromValues(0.1, 0.1, 0.1),
          ),
        ),
      ),
      new TParentEntityComponent(train),
      new TTexturedMeshComponent({ source: 'path', path: trainMiddleMesh }),
      new TTextureComponent(engine.resources.get<TTexture>(trainTexture)!),
      new TVisibilityComponent(),
    ]);

    const end = this.world.createEntity([
      TTransformBundle.with(
        new TTransformComponent(
          new TTransform(
            vec3.fromValues(0, 0, -0.735),
            quat.fromEuler(quat.create(), 0, 180, 0),
            vec3.fromValues(0.1, 0.1, 0.1),
          ),
        ),
      ),
      new TParentEntityComponent(train),
      new TTexturedMeshComponent({ source: 'path', path: trainLocoMesh }),
      new TTextureComponent(engine.resources.get<TTexture>(trainTexture)!),
      new TVisibilityComponent(),
    ]);

    engine.debugPanel.addButtons('Rotation', {
      label: 'Pause',
      onClick: (button) => {
        rotatingComponent.paused = !rotatingComponent.paused;

        if (rotatingComponent.paused) {
          button.label = 'Resume';
        } else {
          button.label = 'Pause';
        }
      },
    });

    this.world.config.lighting = {
      ambientLight: {
        intensity: 0.1,
      },
      directionalLight: {
        direction: vec3.fromValues(-0.5, 0.7, 0.2),
        intensity: 1,
      },
    };
  }
}

const config = {
  states: {
    game: TrainState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
