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
  public mass = 1;

  /**
   * Parent of this component.
   * If null, it is a root component.
   */
  public parentComponent?: TSceneComponent;

  constructor(actor: TActor) {
    super(actor);

    // Always attach to the root component by default, unless this is the root component
    if (actor.rootComponent !== this) {
      this.attachTo(actor.rootComponent);
    }
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
    | null {
    return null;
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
    this.actor.level?.world?.applyCentralForce(this, force);
  }

  public applyCentralImpulse(impulse: vec3) {
    if (!this.collider) return;
    this.actor.level?.world?.applyCentralImpulse(this, impulse);
  }
}
