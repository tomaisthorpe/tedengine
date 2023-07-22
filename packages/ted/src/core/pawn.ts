import type TController from '../input/controller';
import TActor from './actor';

export default class TPawn extends TActor {
  protected controller?: TController;

  public setupController(controller: TController): void {
    this.controller = controller;
  }
}
