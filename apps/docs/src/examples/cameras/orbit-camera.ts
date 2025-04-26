import shipMtl from '@assets/ship.mtl';
import shipMesh from '@assets/ship.obj';
import { vec3 } from 'gl-matrix';
import type { TColorMaterial } from '@tedengine/ted';
import {
  TGameState,
  TResourcePack,
  TMeshComponent,
  TEngine,
  TMaterialComponent,
  TShouldRenderComponent,
  TTransform,
  TTransformComponent,
  TCameraComponent,
  TProjectionType,
  TActiveCameraComponent,
  TOrbitCameraComponent,
  TOrbitCameraSystem,
  TMouseInputSystem,
  TMouseInputComponent,
} from '@tedengine/ted';

class OrbitState extends TGameState {
  public async onCreate(engine: TEngine) {
    const rp = new TResourcePack(engine, {
      meshes: [shipMesh],
      materials: [shipMtl],
    });

    await rp.load();
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    this.world.addSystem(
      new TOrbitCameraSystem(this.world, engine.inputManager),
    );

    this.world.addSystem(
      new TMouseInputSystem(this.world, engine.inputManager),
    );

    const mesh = new TMeshComponent({
      source: 'path',
      path: shipMesh,
    });

    const material = new TMaterialComponent(
      engine.resources.get<TColorMaterial>(shipMtl)!,
    );

    const ship = this.world.createEntity();
    this.world.addComponents(ship, [
      mesh,
      material,
      new TTransformComponent(
        new TTransform(
          vec3.fromValues(0, 0, 0),
          undefined,
          vec3.fromValues(1, 1, 1),
        ),
      ),
      new TShouldRenderComponent(),
    ]);

    const perspective = this.world.createEntity();
    const perspectiveComponent = new TCameraComponent({
      type: TProjectionType.Perspective,
      fov: 45,
    });
    this.world.addComponents(perspective, [
      perspectiveComponent,
      new TTransformComponent(new TTransform(vec3.fromValues(0, 0, 0))),
      new TActiveCameraComponent(),
      new TOrbitCameraComponent({
        distance: 15,
        speed: 1,
        enableDrag: true,
        paused: false,
      }),
      new TMouseInputComponent(),
    ]);
  }
}

const config = {
  states: {
    game: OrbitState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
