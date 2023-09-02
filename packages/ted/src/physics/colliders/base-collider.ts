import type TActor from '../../core/actor';
import type TEventQueue from '../../core/event-queue';
import type { TCollisionEvent } from '../events';
import { TEventTypesPhysics } from '../events';

export type TColliderListener = (event: TCollisionEvent) => void;

export default class TBaseCollider {
  constructor(private events: TEventQueue, private actor: TActor) {}

  addListener(collisionClass: string, func: TColliderListener) {
    this.events.addListener<TCollisionEvent>(
      TEventTypesPhysics.Collision,
      this.actor.uuid,
      (event) => {
        func(event);
      }
    );
  }
}
