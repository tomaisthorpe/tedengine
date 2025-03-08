import { vec3 } from 'gl-matrix';
import {
  TGameState,
  TEngine,
  createBoxMesh,
  TMaterialComponent,
  TMeshComponent,
  TShouldRenderComponent,
  TTransform,
  TTransformComponent,
} from '@tedengine/ted';
import { TRotatingComponent } from '../shared/rotating';
import { TRotatingSystem } from '../shared/rotating';

class BoxState extends TGameState {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    this.world.ecs.addSystem(new TRotatingSystem(this.world.ecs));

    const box = this.world.ecs.createEntity();
    const transform = new TTransformComponent(
      new TTransform(vec3.fromValues(0, 0, -3)),
    );
    const mesh = createBoxMesh(1, 1, 1);
    const rotating = new TRotatingComponent();
    this.world.ecs.addComponents(box, [
      transform,
      new TMeshComponent({ source: 'inline', geometry: mesh.geometry }),
      new TMaterialComponent(mesh.material),
      new TShouldRenderComponent(),
      rotating,
    ]);

    const section = engine.debugPanel.addSection('New Section', true);
    section.addValue('Label', () => 'Value');

    section.addInput(
      'Translate Z',
      'number',
      '-3',
      (value: string) => {
        transform.transform.translation = vec3.fromValues(
          0,
          0,
          parseFloat(value),
        );
      },
      {
        max: -1,
        min: -20,
        step: 0.2,
      },
    );

    section.addButtons('Rotation', {
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

    section.addSelect(
      'Select',
      [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
      ],
      '1',
      (val) => console.log(`Selected: ${val}`),
    );

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    section.addCheckbox('Checkbox', true, (val) => {});
  }
}

const config = {
  states: {
    game: BoxState,
  },
  defaultState: 'game',
  debugPanelOpen: true,
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
