import type { vec3 } from 'gl-matrix';
import type TActor from '../core/actor';
import TTransform from '../math/transform';
import type { ICollider } from '../physics/colliders';
import type {
  TSerializedMeshInstance,
  TSerializedRenderTask,
  TSerializedSpriteInstance,
} from '../renderer/frame-params';
import TActorComponent from './actor-component';
import type {
  TPhysicsBodyOptions,
  TPhysicsBodyType,
} from '../physics/physics-world';

export default class TSceneComponent extends TActorComponent {
  /**
   * Indicates whether a component has the ability to be rendered.
   */
  public canRender = false;

  /**
   * Indicates whether a component should be rendered
   */
  public shouldRender = false;

  /**
   * Transform relative to the parent or actor (if has no parent).
   */
  public transform: TTransform = new TTransform();

  /**
   * Collider for this component.
   */
  public collider?: ICollider;

  /**
   * Parent of this component.
   * If undefined, it is a root component.
   */
  public parentComponent?: TSceneComponent;

  constructor(actor: TActor, bodyOptions?: TPhysicsBodyOptions) {
    super(actor);

    this.physicsBodyOptions = { mass: 1, ...bodyOptions };

    // Always attach to the root component by default, unless this is the root component
    if (actor.rootComponent !== this) {
      this.attachTo(actor.rootComponent);
    }
  }

  // Hidden to prevent editing from outside class
  // as we need to ensure updates are propagated to the physics world
  private physicsBodyOptions: TPhysicsBodyOptions;

  /**
   * Get physics body config for scene component
   */
  public get bodyOptions(): TPhysicsBodyOptions {
    return this.physicsBodyOptions;
  }

  /**
   * Attaches the component as a child to the given component.
   *
   * @param {TSceneComponent} parentComponent
   */
  public attachTo(parentComponent: TSceneComponent): void {
    this.parentComponent = parentComponent;
  }

  public getRenderTask():
    | TSerializedRenderTask
    | TSerializedMeshInstance
    | TSerializedSpriteInstance
    | undefined {
    return undefined;
  }

  /**
   * Gets the component to world transform
   */
  public getWorldTransform(): TTransform {
    if (!this.parentComponent) {
      return this.transform;
    }

    return this.parentComponent.getWorldTransform().add(this.transform);
  }

  public applyCentralForce(force: vec3) {
    if (!this.collider) return;
    this.actor?.world?.applyCentralForce(this, force);
  }

  public applyCentralImpulse(impulse: vec3) {
    if (!this.collider) return;
    this.actor?.world?.applyCentralImpulse(this, impulse);
  }

  public setFixedRotation(fixedRotation: boolean) {
    this.physicsBodyOptions.fixedRotation = fixedRotation;

    // Update with the world
    this.actor?.world?.updateBodyOptions(this, this.bodyOptions);
  }

  public setBodyType(type: TPhysicsBodyType) {
    this.physicsBodyOptions.type = type;

    this.actor?.world?.updateBodyOptions(this, this.bodyOptions);
  }

  public setLinearDamping(damping: number) {
    this.actor?.world?.updateBodyOptions(this, { linearDamping: damping });
  }

  public setAngularDamping(damping: number) {
    this.actor?.world?.updateBodyOptions(this, { angularDamping: damping });
  }

  public setLinearVelocity(velocity: vec3) {
    this.actor?.world?.updateBodyOptions(this, { linearVelocity: velocity });
  }

  public setAngularVelocity(velocity: vec3) {
    this.actor?.world?.updateBodyOptions(this, { angularVelocity: velocity });
  }

  public setFriction(friction: number) {
    this.actor?.world?.updateBodyOptions(this, { friction });
  }

  /**
   * Triggers don't collide with other objects, but they still trigger collision events
   * @param isTrigger
   */
  public setIsTrigger(isTrigger: boolean) {
    this.actor?.world?.updateBodyOptions(this, { isTrigger });
  }

  /**
   * Apply transforms ensure transform updates get propagated to the physics world
   */
  public applyTransform() {
    this.actor?.world?.updateTransform(this);
  }
}
