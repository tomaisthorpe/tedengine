import { vec3 } from 'gl-matrix';
import {
  TGameState,
  TEngine,
  createBoxMesh,
  TMaterialComponent,
  TMeshComponent,
  TVisibilityComponent,
  TTransform,
  TTransformComponent,
  TTransformBundle,
} from '@tedengine/ted';
import { TRotatingComponent } from '../shared/rotating';
import { TRotatingSystem } from '../shared/rotating';

class BoxState extends TGameState {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    this.world.addSystem(new TRotatingSystem(this.world));

    const entity = this.world.createEntity();
    const mesh = createBoxMesh(1, 1, 1);
    this.world.addComponents(entity, [
      TTransformBundle,
      new TTransformComponent(new TTransform(vec3.fromValues(0, 0, -3))),
      new TRotatingComponent(),
      new TVisibilityComponent(),
      new TMeshComponent({ source: 'inline', geometry: mesh.geometry }),
      new TMaterialComponent(mesh.material),
    ]);

    const section = engine.debugPanel.addSection('New Section', true);
    section.addValue('Label', () => 'Value');

    section.addInput(
      'Translate Z',
      'number',
      '-3',
      (value: string) => {
        const transform = this.world.getComponent(entity, TTransformComponent);
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
        const rotating = this.world.getComponent(entity, TRotatingComponent);
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
