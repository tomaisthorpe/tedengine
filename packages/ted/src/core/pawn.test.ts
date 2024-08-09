import TPawn from '../core/pawn';
import TController from '../input/controller';
import TEventQueue from './event-queue';

describe('TPawn', () => {
  let pawn: TPawn;
  let controller: TController;

  beforeEach(() => {
    pawn = new TPawn();
    const queue = new TEventQueue();
    controller = new TController(queue);
  });

  test('should set up the controller', () => {
    pawn.setupController(controller);
    expect(pawn['controller']).toBe(controller);
  });
});
