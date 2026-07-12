import landscapeMtl from '@assets/landscape.mtl';
import landscapeMesh from '@assets/landscape.obj';
import { vec3 } from 'gl-matrix';
import type { TColorMaterial } from '@tedengine/ted';
import {
  TEngine,
  TGameState,
  TMaterialComponent,
  TMeshComponent,
  TResourcePack,
  TTransform,
  TTransformBundle,
  TTransformComponent,
  TVisibilityComponent,
} from '@tedengine/ted';
import { TRotatingComponent, TRotatingSystem } from '../shared/rotating';

export const createPostProcessingExampleScene = async (
  state: TGameState,
  engine: TEngine,
) => {
  const resources = new TResourcePack(engine, {
    meshes: [landscapeMesh],
    materials: [landscapeMtl],
  });
  await resources.load();

  state.world.addSystem(new TRotatingSystem(state.world));

  const transform = new TTransform(
    vec3.fromValues(0, 0, -2),
    undefined,
    vec3.fromValues(0.1, 0.1, 0.1),
  );
  transform.rotateX(0.3);

  const rotating = new TRotatingComponent(vec3.fromValues(0, 0.35, 0));
  const entity = state.world.createEntity();
  state.world.addComponents(entity, [
    TTransformBundle.with(new TTransformComponent(transform)),
    new TVisibilityComponent(),
    rotating,
    new TMeshComponent({ source: 'path', path: landscapeMesh }),
    new TMaterialComponent(
      engine.resources.get<TColorMaterial>(landscapeMtl)!,
    ),
  ]);

  engine.debugPanel.addButtons('Rotation', {
    label: 'Pause',
    onClick: (button) => {
      rotating.paused = !rotating.paused;
      button.label = rotating.paused ? 'Resume' : 'Pause';
    },
  });

  state.world.config.lighting = {
    ambientLight: { intensity: 0.1 },
    directionalLight: {
      direction: vec3.fromValues(-0.5, 0.7, 0.2),
      intensity: 1,
    },
  };
};
