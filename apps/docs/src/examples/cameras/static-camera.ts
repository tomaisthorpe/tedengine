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
  TTransformComponent,
  TTransform,
  TShouldRenderComponent,
  TProjectionType,
  TCameraComponent,
  TActiveCameraComponent,
} from '@tedengine/ted';
import { TRotatingComponent, TRotatingSystem } from '../shared/rotating';

class AubState extends TGameState {
  public async onCreate(engine: TEngine) {
    const rp = new TResourcePack(engine, {
      meshes: [shipMesh],
      materials: [shipMtl],
    });

    await rp.load();
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    this.world.addSystem(new TRotatingSystem(this.world));

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
          vec3.fromValues(0, 0, -400),
          undefined,
          vec3.fromValues(60, 60, 60),
        ),
      ),
      new TShouldRenderComponent(),
      new TRotatingComponent(),
    ]);

    const perspective = this.world.createEntity();
    const perspectiveComponent = new TCameraComponent({
      type: TProjectionType.Perspective,
      fov: 45,
      zNear: 0.1,
      zFar: 1000,
    });
    this.world.addComponents(perspective, [
      perspectiveComponent,
      new TTransformComponent(new TTransform(vec3.fromValues(0, 0, 500))),
      new TActiveCameraComponent(),
    ]);

    const ortho = this.world.createEntity();
    const orthoComponent = new TCameraComponent({
      type: TProjectionType.Orthographic,
      zNear: 0.1,
      zFar: 1000,
    });
    this.world.addComponents(ortho, [
      orthoComponent,
      new TTransformComponent(new TTransform()),
    ]);

    const section = engine.debugPanel.addSection('Camera', true);

    section.addSelect(
      'Projection Mode',
      [
        { label: 'Perspective', value: 'perspective' },
        { label: 'Orthographic', value: 'ortho' },
      ],
      'perspective',
      (mode) => {
        if (mode === 'perspective') {
          this.world.cameraSystem.setActiveCamera(perspective);
        } else {
          this.world.cameraSystem.setActiveCamera(ortho);
        }
      },
    );

    section.addInput(
      'FOV',
      'range',
      '45',
      (value: string) => {
        const cfg = perspectiveComponent.cameraConfig;
        if (cfg.type === TProjectionType.Perspective) {
          cfg.fov = parseFloat(value);
        }
      },
      {
        max: 120,
        min: 20,
        step: 5,
        showValueBubble: true,
      },
    );
  }
}

const config = {
  states: {
    game: AubState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
