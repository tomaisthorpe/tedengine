import { v4 as uuidv4 } from 'uuid';
import type TActor from '../core/actor';
import type TEngine from '../engine/engine';

export interface TActorComponentWithOnUpdate extends TActorComponent {
  onUpdate(engine: TEngine, delta: number): Promise<void>;
}

const hasOnUpdate = (
  state: TActorComponent
): state is TActorComponentWithOnUpdate =>
  (state as TActorComponentWithOnUpdate).onUpdate !== undefined;

/**
 * Component for an actor.
 * Only contains updater and cannot be rendered.
 */
export default class TActorComponent {
  public uuid: string = uuidv4();

  constructor(public actor: TActor) {
    // @todo should the compenent itself do this?
    actor.components.push(this);
  }

  /**
   * Called every frame with delta
   *
   * @param engine
   * @param delta time since last frame
   *
   * **DO NOT OVERRIDE!** Add [[`onUpdate`]] instead.
   * @hidden
   */
  public update(engine: TEngine, delta: number): void {
    if (hasOnUpdate(this)) {
      this.onUpdate(engine, delta);
    }
  }
}
