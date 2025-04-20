import { quat } from 'gl-matrix';
import { vec3 } from 'gl-matrix';
import type TWorld from '../core/world';
import { TTransformComponent } from '../components';
import type { TECS, TEntity } from '../ecs/ecs';
import type TECSQuery from '../ecs/query';
import { TSystem, TSystemPriority } from '../ecs/system';
import type TEngine from '../engine/engine';
import { TRigidBodyComponent } from './rigid-body-component';
import type { TPhysicsCollision } from './physics-world';
import type TEventQueue from '../core/event-queue';
import { TEventTypesPhysics } from './events';

export class TPhysicsSystem extends TSystem {
  public readonly priority: number = TSystemPriority.Update;
  
  private query: TECSQuery;

  constructor(
    private ecs: TECS,
    private events: TEventQueue,
  ) {
    super();

    this.query = ecs.createQuery([TRigidBodyComponent, TTransformComponent]);
  }

  public async update(
    engine: TEngine,
    world: TWorld,
    ecs: TECS,
    delta: number,
  ): Promise<void> {
    const entities = this.query.execute();

    const bodies: { [key: string]: TRigidBodyComponent } = {};

    for (const entity of entities) {
      const rigidBody = this.ecs
        .getComponents(entity)
        ?.get(TRigidBodyComponent);
      const transform = this.ecs
        .getComponents(entity)
        ?.get(TTransformComponent);

      if (!rigidBody || !transform) {
        continue;
      }

      if (!rigidBody.isRegistered) {
        world.registerRigidBody(entity, rigidBody, transform.transform);
        rigidBody.isRegistered = true;
      }

      if (rigidBody.optionsUpdated) {
        world.updateBodyOptions(entity, rigidBody.physicsOptions);
        rigidBody.optionsUpdated = false;
      }

      if (rigidBody.applyTransform) {
        world.updateTransform(entity, transform.transform);
        rigidBody.applyTransform = false;
      }

      bodies[entity.toString()] = rigidBody;
    }

    const result = await world.simulateStep(delta);

    for (const body of result.bodies) {
      const rigidBody = bodies[body.uuid];
      if (!rigidBody) {
        continue;
      }

      const transform = this.ecs
        .getComponents(parseInt(body.uuid))
        ?.get(TTransformComponent);
      if (!transform) {
        continue;
      }

      transform.transform.translation = vec3.fromValues(...body.translation);
      transform.transform.rotation = quat.fromValues(...body.rotation);

      rigidBody.applyUpdate(body);
    }

    this.handleCollisions(world, result.collisions);
  }

  private handleCollisions(world: TWorld, collisions: TPhysicsCollision[]) {
    for (const collision of collisions) {
      const entityA = this.ecs.getComponents(parseInt(collision.bodies[0]));
      const entityB = this.ecs.getComponents(parseInt(collision.bodies[1]));
      if (!entityA || !entityB) {
        continue;
      }

      this.publishCollision(
        world,
        parseInt(collision.bodies[0]),
        parseInt(collision.bodies[1]),
      );
      this.publishCollision(
        world,
        parseInt(collision.bodies[1]),
        parseInt(collision.bodies[0]),
      );
    }
  }

  private publishCollision(world: TWorld, entityA: TEntity, entityB: TEntity) {
    const entityBCollider = this.ecs
      .getComponents(entityB)
      ?.get(TRigidBodyComponent);
    if (!entityBCollider) {
      return;
    }

    const collisionClass =
      entityBCollider.collider.collisionClass ||
      world.config.defaultCollisionClass;

    this.events.broadcast({
      type: TEventTypesPhysics.COLLISION_START,
      subType: collisionClass,
      payload: {
        entityA,
        entityB,
      },
    });
  }
}
