import { vec3 } from 'gl-matrix';
import {
  TRotatingComponent,
  TBoxComponent,
  TGameState,
  TEngine,
  TActor,
} from '@tedengine/ted';

class Actor extends TActor {
  constructor(engine: TEngine) {
    super();

    const rotating = new TRotatingComponent(engine, this);

    const box = new TBoxComponent(engine, this, 1, 1, 1);
    box.attachTo(rotating);

    this.rootComponent.transform.translation = vec3.fromValues(0, 0, -3);

    const section = engine.debugPanel.addSection('New Section', true);
    section.addValue('Label', () => 'Value');

    section.addInput(
      'Translate Z',
      'number',
      '-3',
      (value: string) => {
        this.rootComponent.transform.translation = vec3.fromValues(
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

class BoxState extends TGameState {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    const box = new Actor(engine);
    this.addActor(box);
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
