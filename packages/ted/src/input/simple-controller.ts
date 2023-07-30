import type TEngine from '../engine/engine';
import TController from './controller';

/**
 * TSimpleController can be used as a drop-in controller for simple games.
 *
 * It follows a common pattern used in a number of games.
 */
export default class TSimpleController extends TController {
  constructor(engine: TEngine) {
    super(engine.events);

    // Movement
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
