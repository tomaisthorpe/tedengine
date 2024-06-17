import { v4 as uuidv4 } from 'uuid';
import type TActor from '../core/actor';
import type TEngine from '../engine/engine';

export interface TActorComponentWithOnUpdate extends TActorComponent {
  onUpdate(engine: TEngine, delta: number): Promise<void>;
}

export interface TActorComponentWithOnDestroy extends TActorComponent {
  onDestroy(): void;
}

const hasOnUpdate = (
  state: TActorComponent,
): state is TActorComponentWithOnUpdate =>
  (state as TActorComponentWithOnUpdate).onUpdate !== undefined;

const hasOnDestroy = (
  state: TActorComponent,
): state is TActorComponentWithOnDestroy =>
  (state as TActorComponentWithOnDestroy).onDestroy !== undefined;

/**
 * Component for an actor.
 * Only contains updater and cannot be rendered.
 */
export default class TActorComponent {
  public uuid: string = uuidv4();

  public dead = false;

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

  public destroy(): void {
    if (this.dead) return;

    this.dead = true;
    if (hasOnDestroy(this)) {
      this.onDestroy();
    }
  }
}
