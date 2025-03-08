import { TComponent } from '../ecs/component';
import type { TColliderConfig } from './colliders';
import type { TPhysicsBody, TPhysicsBodyOptions } from './physics-world';

export class TRigidBodyComponent extends TComponent {
  private _physicsOptions: TPhysicsBodyOptions;
  public collider: TColliderConfig;

  // Whether the body has been registered with the physics world
  public isRegistered = false;
  public optionsUpdated = false;

  // Set this to true if you want to apply the transform to the physics body
  public applyTransform = false;

  constructor(physicsOptions: TPhysicsBodyOptions, collider: TColliderConfig) {
    super();

    this._physicsOptions = physicsOptions;
    this.collider = collider;
  }

  public set physicsOptions(physicsOptions: TPhysicsBodyOptions) {
    this._physicsOptions = physicsOptions;
    this.optionsUpdated = true;
  }

  public get physicsOptions(): TPhysicsBodyOptions {
    return this._physicsOptions;
  }

  // @todo find a better way to keep velocity up to date, potentially physics options shouldn't be a property
  public applyUpdate(body: TPhysicsBody) {
    this._physicsOptions.linearVelocity = body.linearVelocity;
    this._physicsOptions.angularVelocity = body.angularVelocity;
  }
}
