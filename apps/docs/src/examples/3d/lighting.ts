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
  TShouldRenderComponent,
  TTransformComponent,
  TMaterialComponent,
  TActiveCameraComponent,
  TProjectionType,
  TCameraComponent,
  TOrbitCameraComponent,
  TMouseInputComponent,
  TOrbitCameraSystem,
  TMouseInputSystem,
} from '@tedengine/ted';

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
    this.world.ecs.addSystem(
      new TOrbitCameraSystem(this.world.ecs, engine.inputManager),
    );

    this.world.ecs.addSystem(
      new TMouseInputSystem(this.world.ecs, engine.inputManager),
    );
    const entity = this.world.ecs.createEntity();

    const mesh = new TMeshComponent({ source: 'path', path: landscapeMesh });
    const material = new TMaterialComponent(
      engine.resources.get<TColorMaterial>(landscapeMtl)!,
    );

    const transform = new TTransform(
      vec3.fromValues(0, 0, 0),
      undefined,
      vec3.fromValues(0.1, 0.1, 0.1),
    );

    this.world.ecs.addComponents(entity, [
      new TTransformComponent(transform),
      new TShouldRenderComponent(),
      mesh,
      material,
    ]);

    const camera = this.world.ecs.createEntity();
    this.world.ecs.addComponents(camera, [
      new TTransformComponent(new TTransform(vec3.fromValues(0, 0, 0))),
      new TCameraComponent({ type: TProjectionType.Perspective, fov: 45 }),
      new TActiveCameraComponent(),
      new TMouseInputComponent(),
      new TOrbitCameraComponent({
        distance: 2.5,
        speed: 0,
        enableDrag: true,
        paused: false,
      }),
    ]);

    this.world.config.lighting = {
      shadows: {
        enabled: true,
      },
      ambientLight: {
        intensity: 0.1,
        color: vec3.fromValues(1, 1, 1),
      },
      directionalLight: {
        direction: vec3.fromValues(-0.5, 0.7, 0.2),
        intensity: 1,
        color: vec3.fromValues(1, 1, 1),
      },
    };

    const section = engine.debugPanel.addSection('Lighting', true);
    section.addInput(
      'Ambient Light Intensity',
      'range',
      this.world.config.lighting.ambientLight.intensity.toString(),
      (value) => {
        this.world.config.lighting.ambientLight.intensity = parseFloat(value);
      },
      {
        min: 0,
        max: 1,
        step: 0.1,
        showValueBubble: true,
      },
    );

    section.addColorPicker(
      'Ambient Light Color',
      this.world.config.lighting.ambientLight.color,
      (value) => {
        this.world.config.lighting.ambientLight.color = value;
      },
    );

    section.addInput(
      'Directional Light [x]',
      'range',
      this.world.config.lighting.directionalLight.direction[0].toString(),
      (value) => {
        this.world.config.lighting.directionalLight.direction[0] =
          parseFloat(value);
      },
      {
        min: -1,
        max: 1,
        step: 0.1,
        showValueBubble: true,
      },
    );

    section.addInput(
      'Directional Light [y]',
      'range',
      this.world.config.lighting.directionalLight.direction[1].toString(),
      (value) => {
        this.world.config.lighting.directionalLight.direction[1] =
          parseFloat(value);
      },
      {
        min: -1,
        max: 1,
        step: 0.1,
        showValueBubble: true,
      },
    );

    section.addInput(
      'Directional Light [z]',
      'range',
      this.world.config.lighting.directionalLight.direction[2].toString(),
      (value) => {
        this.world.config.lighting.directionalLight.direction[2] =
          parseFloat(value);
      },
      {
        min: -1,
        max: 1,
        step: 0.1,
        showValueBubble: true,
      },
    );

    section.addInput(
      'Directional Light Intensity',
      'range',
      this.world.config.lighting.directionalLight.intensity.toString(),
      (value) => {
        this.world.config.lighting.directionalLight.intensity =
          parseFloat(value);
      },
      {
        min: 0,
        max: 1,
        step: 0.1,
        showValueBubble: true,
      },
    );

    section.addColorPicker(
      'Directional Light Color',
      this.world.config.lighting.directionalLight.color,
      (value) => {
        this.world.config.lighting.directionalLight.color = value;
      },
    );

    section.addCheckbox(
      'Shadows Enabled',
      this.world.config.lighting.shadows?.enabled,
      (value) => {
        this.world.config.lighting.shadows.enabled = value;
      },
    );
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
