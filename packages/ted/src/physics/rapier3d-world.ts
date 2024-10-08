import { vec3 } from 'gl-matrix';
import type {
  TCollisionClass,
  TWorldConfig,
  TPhysicsMode,
} from '../core/world';
import type { TColliderConfig } from './colliders';
import { TColliderType } from './colliders';
import type { TPhysicsWorldDebug } from './physics-world';
import {
  TPhysicsBodyType,
  type TPhysicsBody,
  type TPhysicsBodyOptions,
  type TPhysicsCollision,
  type TPhysicsQueryAreaResult,
  type TPhysicsQueryLineResult,
  type TPhysicsQueryOptions,
  type TPhysicsWorld,
} from './physics-world';
import type {
  Collider,
  ColliderDesc,
  EventQueue,
  RigidBody,
  World,
} from '@dimforge/rapier3d-compat';
import type { TBoxColliderConfig } from './colliders/box-collider';
import type { TPlaneColliderConfig } from './colliders/plane-collider';
import type { TSphereColliderConfig } from './colliders/sphere-collider';

export interface TRapierObject {
  uuid: string;
  body: RigidBody;
}

export default class TRapier3DWorld implements TPhysicsWorld {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  // TODO fix this
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  private RAPIER!: typeof import('@dimforge/rapier3d-compat');

  // TODO remove !
  private world!: World;
  private eventQueue!: EventQueue;
  private defaultCollisionClass!: string;
  private collisionClasses: {
    [key: string]: {
      groupNumber: number;
      filter: number;
      ignoredBy: number[];
    };
  } = {};

  private physicsMode: TPhysicsMode = '3d';
  private physicsScale = 1;

  private objects: TRapierObject[] = [];

  public async create(config: TWorldConfig): Promise<void> {
    this.RAPIER = await import('@dimforge/rapier3d-compat');
    await this.RAPIER.init();

    this.physicsScale = config.physicsScale || 1;

    this.world = new this.RAPIER.World({
      x: config.gravity[0],
      y: config.gravity[1],
      z: config.gravity[2],
    });

    this.eventQueue = new this.RAPIER.EventQueue(true);

    this.setupCollisionClasses(config.collisionClasses);
    this.defaultCollisionClass = config.defaultCollisionClass;

    if (config.mode) {
      this.physicsMode = config.mode;
    }
  }

  private setupCollisionClasses(collisionClasses: TCollisionClass[]) {
    // Scene queries are group 1
    let nextGroup = 2;
    for (const cc of collisionClasses) {
      let filter = 0xffff;

      if (cc.ignores) {
        for (const ig of cc.ignores) {
          // Find the group number
          const id = this.collisionClasses[ig];
          id.ignoredBy.push(nextGroup);
          filter &= ~id.groupNumber;
        }
      }

      this.collisionClasses[cc.name] = {
        groupNumber: nextGroup,
        filter,
        ignoredBy: [],
      };

      nextGroup = nextGroup << 1;
    }

    // Apply ignoredBy to masks
    for (const name in this.collisionClasses) {
      const cc = this.collisionClasses[name];
      for (const ig of cc.ignoredBy) {
        cc.filter &= ~ig;
      }
    }
  }

  private getCollisionGroup(name: string): number {
    const cc = this.collisionClasses[name];
    if (!cc) {
      throw new Error(`Collision class ${name} not found`);
    }

    const a = (cc.groupNumber << 16) + cc.filter;

    return a;
  }

  step(
    delta: number,
    debug?: boolean,
  ): {
    bodies: TPhysicsBody[];
    collisions: TPhysicsCollision[];
    debug?: TPhysicsWorldDebug;
  } {
    this.world.timestep = delta;
    this.world.step(this.eventQueue);

    const collisions: TPhysicsCollision[] = [];

    this.eventQueue.drainCollisionEvents((handleA, handleB, started) => {
      // @todo handle collision exit events
      if (!started) return;

      const bodyA = this.findUUIDByHandle(handleA);
      const bodyB = this.findUUIDByHandle(handleB);

      if (!bodyA || !bodyB) return;

      collisions.push({ bodies: [bodyA, bodyB] });
    });

    const bodies: TPhysicsBody[] = [];

    // Filter out any bodies that have been deleted
    this.objects = this.objects.filter((obj) => obj.body.isValid());

    for (const obj of this.objects) {
      bodies.push({
        uuid: obj.uuid,
        translation: [
          obj.body.translation().x / this.physicsScale,
          obj.body.translation().y / this.physicsScale,
          obj.body.translation().z / this.physicsScale,
        ],
        rotation: [
          obj.body.rotation().x,
          obj.body.rotation().y,
          obj.body.rotation().z,
          obj.body.rotation().w,
        ],
        angularVelocity: [
          obj.body.angvel().x,
          obj.body.angvel().y,
          obj.body.angvel().z,
        ],
        linearVelocity: [
          obj.body.linvel().x,
          obj.body.linvel().y,
          obj.body.linvel().z,
        ],
      });
    }

    if (debug) {
      const { vertices, colors } = this.world.debugRender();
      return {
        bodies,
        collisions,
        debug: {
          vertices: vertices.map((v) => v / this.physicsScale),
          colors,
        },
      };
    }

    return { bodies, collisions };
  }

  /**
   * Adds a physics body to the world.
   *
   * @param uuid - The unique identifier for the body.
   * @param collider - The configuration for the collider shape.
   * @param translation - The initial translation of the body.
   * @param rotation - The initial rotation of the body.
   * @param options - Additional options for the body (optional).
   */
  addBody(
    uuid: string,
    collider: TColliderConfig,
    translation: [number, number, number],
    rotation: [number, number, number, number],
    options?: TPhysicsBodyOptions | undefined,
  ): void {
    // let shape:
    let shape: ColliderDesc;

    if (collider.type === TColliderType.BOX) {
      const config = collider as TBoxColliderConfig;
      shape = this.RAPIER.ColliderDesc.cuboid(
        config.width / 2 * this.physicsScale,
        config.height / 2 * this.physicsScale,
        config.depth / 2 * this.physicsScale,
      );
    } else if (collider.type === TColliderType.PLANE) {
      const config = collider as TPlaneColliderConfig;
      shape = this.RAPIER.ColliderDesc.cuboid(
        config.width / 2 * this.physicsScale,
        0.000001,
        config.height / 2 * this.physicsScale,
      );
    } else if (collider.type === TColliderType.SPHERE) {
      const config = collider as TSphereColliderConfig;
      shape = this.RAPIER.ColliderDesc.ball(config.radius * this.physicsScale);
    } else {
      throw new Error('Unknown collider type');
    }

    shape.setActiveEvents(this.RAPIER.ActiveEvents.COLLISION_EVENTS);
    shape.setMass(options?.mass ?? 1.0);
    shape.setCollisionGroups(
      this.getCollisionGroup(
        collider.collisionClass ?? this.defaultCollisionClass,
      ),
    );

    if (options?.friction) {
      shape.setFriction(options.friction);
    }

    if (options?.isTrigger) {
      shape.setSensor(true);
    }

    const bodyDesc =
      options?.type === TPhysicsBodyType.STATIC
        ? this.RAPIER.RigidBodyDesc.fixed()
        : this.RAPIER.RigidBodyDesc.dynamic();

    // If we are in 2D mode, disable the Z axis, and only allow rotations around Z
    if (this.physicsMode === '2d') {
      bodyDesc.enabledTranslations(true, true, false);
      bodyDesc.enabledRotations(false, false, true);
    }

    if (options?.fixedRotation) {
      bodyDesc.lockRotations();
    }

    bodyDesc.setTranslation(
      translation[0] * this.physicsScale,
      translation[1] * this.physicsScale,
      translation[2] * this.physicsScale,
    );
    bodyDesc.setRotation({
      x: rotation[0],
      y: rotation[1],
      z: rotation[2],
      w: rotation[3],
    });

    // Damping
    if (options?.linearDamping) {
      bodyDesc.setLinearDamping(options.linearDamping);
    }

    if (options?.angularDamping) {
      bodyDesc.setAngularDamping(options.angularDamping);
    }

    // Initial velocities
    if (options?.linearVelocity) {
      bodyDesc.setLinvel(
        options.linearVelocity[0],
        options.linearVelocity[1],
        options.linearVelocity[2],
      );
    }

    if (options?.angularVelocity) {
      bodyDesc.setAngvel({
        x: options.angularVelocity[0],
        y: options.angularVelocity[1],
        z: options.angularVelocity[2],
      });
    }

    const body = this.world.createRigidBody(bodyDesc);

    // Attach the collider to the body
    this.world.createCollider(shape, body);

    this.objects.push({ uuid, body });
  }

  removeBody(uuid: string): void {
    const [body] = this.findBody(uuid);
    if (!body) {
      throw new Error(`Body with uuid ${uuid} not found`);
    }

    this.world.removeRigidBody(body);

    // Remove the body from the list
    this.objects = this.objects.filter((obj) => obj.uuid !== uuid);
  }

  applyCentralForce(uuid: string, force: vec3): void {
    const [body] = this.findBody(uuid);
    if (!body) {
      throw new Error(`Body with uuid ${uuid} not found`);
    }

    body.resetForces(true);
    body.addForce(
      {
        x: force[0],
        y: force[1],
        z: force[2],
      },
      true,
    );
  }

  applyCentralImpulse(uuid: string, impulse: vec3): void {
    const [body] = this.findBody(uuid);
    if (!body) {
      throw new Error(`Body with uuid ${uuid} not found`);
    }

    body.applyImpulse(
      {
        x: impulse[0],
        y: impulse[1],
        z: impulse[2],
      },
      true,
    );
  }

  updateBodyOptions(uuid: string, options: TPhysicsBodyOptions): void {
    // @todo you cannot change mass of a collider after it has been created

    const [body, collider] = this.findBody(uuid);
    if (!body || !collider) {
      throw new Error(`Body with uuid ${uuid} not found`);
    }

    if (options.angularDamping) {
      body.setAngularDamping(options.angularDamping);
    }

    if (options.linearDamping) {
      body.setLinearDamping(options.linearDamping);
    }

    if (options.friction) {
      collider.setFriction(options.friction);
    }

    if (options.angularVelocity) {
      body.setAngvel(
        {
          x: options.angularVelocity[0],
          y: options.angularVelocity[1],
          z: options.angularVelocity[2],
        },
        true,
      );
    }

    if (options.linearVelocity) {
      body.setLinvel(
        {
          x: options.linearVelocity[0],
          y: options.linearVelocity[1],
          z: options.linearVelocity[2],
        },
        true,
      );
    }

    if (options.isTrigger) {
      collider.setSensor(true);
    }
  }

  private findBody(
    uuid: string,
  ): [RigidBody | undefined, Collider | undefined] {
    // @todo this might not return a body
    const result = this.objects.find((body) => body.uuid === uuid);
    if (result) {
      return [result.body, result.body.collider(0)];
    }
    return [undefined, undefined];
  }

  private findUUIDByHandle(handle: number): string | undefined {
    return this.objects.find((body) => body.body.handle === handle)?.uuid;
  }

  updateTransform(
    uuid: string,
    translation: [number, number, number],
    rotation: [number, number, number, number],
  ): void {
    const [body] = this.findBody(uuid);
    if (!body) {
      throw new Error(`Body with uuid ${uuid} not found`);
    }

    body.setTranslation(
      {
        x: translation[0] * this.physicsScale,
        y: translation[1] * this.physicsScale,
        z: translation[2] * this.physicsScale,
      },
      true,
    );

    body.setRotation(
      {
        x: rotation[0],
        y: rotation[1],
        z: rotation[2],
        w: rotation[3],
      },
      true,
    );
  }

  queryLine(
    from: vec3,
    to: vec3,
    options?: TPhysicsQueryOptions | undefined,
  ): TPhysicsQueryLineResult[] {
    const dir = vec3.sub(vec3.create(), to, from);
    const length = vec3.length(dir);
    const normalized = vec3.normalize(vec3.create(), dir);

    const ray = new this.RAPIER.Ray(
      {
        x: from[0] * this.physicsScale,
        y: from[1] * this.physicsScale,
        z: from[2] * this.physicsScale,
      },
      {
        x: normalized[0],
        y: normalized[1],
        z: normalized[2],
      },
    );

    const filterGroup = options?.collisionClasses
      ? this.calculateQueryFilterGroup(options?.collisionClasses)
      : undefined;

    const result: TPhysicsQueryLineResult[] = [];

    this.world.intersectionsWithRay(
      ray,
      length,
      true,
      (intersection) => {
        const body = intersection.collider.parent();
        // @todo should this error be handled?
        if (!body) {
          return true;
        }

        // @todo should this error be handled?
        const uuid = this.findUUIDByHandle(body.handle);
        if (!uuid) {
          return true;
        }

        result.push({ uuid, distance: intersection.timeOfImpact });

        return true;
      },
      undefined,
      filterGroup,
    );

    return result;
  }

  queryArea(
    from: vec3,
    to: vec3,
    options?: TPhysicsQueryOptions | undefined,
  ): TPhysicsQueryAreaResult[] {
    // Scale to and from to the physics scale
    const toScaled = vec3.scale(vec3.create(), to, this.physicsScale);
    const fromScaled = vec3.scale(vec3.create(), from, this.physicsScale);

    const size = vec3.sub(vec3.create(), toScaled, fromScaled);
    const midPoint = vec3.scale(
      vec3.create(),
      vec3.add(vec3.create(), toScaled, fromScaled),
      0.5,
    );

    const shape = new this.RAPIER.Cuboid(
      Math.abs(size[0]) / 2,
      Math.abs(size[1]) / 2,
      Math.abs(size[2]) / 2,
    );

    const filterGroup = options?.collisionClasses
      ? this.calculateQueryFilterGroup(options?.collisionClasses)
      : undefined;

    const result: TPhysicsQueryAreaResult[] = [];

    this.world.intersectionsWithShape(
      {
        x: midPoint[0],
        y: midPoint[1],
        z: midPoint[2],
      },
      { x: 0, y: 0, z: 0, w: 1 },
      shape,
      (collider) => {
        const body = collider.parent();
        // @todo should this error be handled?
        if (!body) {
          return true;
        }

        // @todo should this error be handled?
        const uuid = this.findUUIDByHandle(body.handle);
        if (!uuid) {
          return true;
        }

        result.push({ uuid });

        return true;
      },
      undefined,
      filterGroup,
    );

    return result;
  }

  private calculateQueryFilterGroup(collisionClasses: string[]): number {
    let group = 0;
    for (const cc of collisionClasses) {
      group += this.collisionClasses[cc].groupNumber;
    }

    return (1 << 16) + group;
  }
}
