import type TEventQueue from '../core/event-queue';
import TController from './controller';

/**
 * TSimpleController can be used as a drop-in controller for simple games.
 *
 * It follows a common pattern used in a number of games.
 */
export default class TSimpleController extends TController {
  constructor(eventQueue: TEventQueue) {
    super(eventQueue);

    // Movement
    this.addAxisFromKeyEvent('Vertical', 'w', 1);
    this.addAxisFromKeyEvent('Vertical', 's', -1);
    this.addAxisFromKeyEvent('Horizontal', 'a', -1);
    this.addAxisFromKeyEvent('Horizontal', 'd', 1);

    this.addActionFromKeyEvent('Up', 'w');
    this.addActionFromKeyEvent('Left', 'a');
    this.addActionFromKeyEvent('Down', 's');
    this.addActionFromKeyEvent('Right', 'd');

    // Various actions
    this.addActionFromKeyEvent('Space', 'Space');
    this.addActionFromKeyEvent('Ctrl', 'Control');
    this.addActionFromKeyEvent('Shift', 'Shift');

    // Interaction buttons
    this.addActionFromKeyEvent('E', 'e');
    this.addActionFromKeyEvent('Q', 'q');

    // Mouse location
    this.enableMouseTracking();
  }
}
