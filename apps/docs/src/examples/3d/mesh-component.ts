import landscapeMtl from '@assets/landscape.mtl';
import landscapeMesh from '@assets/landscape.obj';
import { vec3 } from 'gl-matrix';
import type { TColorMaterial } from '@tedengine/ted';
import {
  TGameState,
  TResourcePack,
  TMeshComponent,
  TEngine,
  TTransform,
  TTransformComponent,
  TShouldRenderComponent,
  TMaterialComponent,
} from '@tedengine/ted';
import { TRotatingComponent, TRotatingSystem } from '../shared/rotating';

class MeshState extends TGameState {
  public async onCreate(engine: TEngine) {
    const rp = new TResourcePack(engine, {
      meshes: [landscapeMesh],
      materials: [landscapeMtl],
    });

    await rp.load();

    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    this.world.ecs.addSystem(new TRotatingSystem(this.world.ecs));

    const mesh = new TMeshComponent({ source: 'path', path: landscapeMesh });
    const material = new TMaterialComponent(
      engine.resources.get<TColorMaterial>(landscapeMtl)!,
    );

    const transform = new TTransform(
      vec3.fromValues(0, 0, -2),
      undefined,
      vec3.fromValues(0.1, 0.1, 0.1),
    );
    transform.rotateX(0.3);

    const rotating = new TRotatingComponent(vec3.fromValues(0, 0.35, 0));

    const entity = this.world.ecs.createEntity();
    this.world.ecs.addComponents(entity, [
      new TTransformComponent(transform),
      new TShouldRenderComponent(),
      rotating,
      mesh,
      material,
    ]);

    engine.debugPanel.addButtons('Rotation', {
      label: 'Pause',
      onClick: (button) => {
        rotating.paused = !rotating.paused;

        if (rotating.paused) {
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
    game: MeshState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
