import type { vec3 } from 'gl-matrix';
import type { TColliderConfig } from './colliders';
import { TColliderType } from './colliders';
import type { TBoxColliderConfig } from './colliders/box-collider';
import type { TPlaneColliderConfig } from './colliders/plane-collider';
import type { TSphereColliderConfig } from './colliders/sphere-collider';
import type { TWorldConfig } from '../core/world';
import {
  TPhysicsBodyType,
  type TPhysicsBody,
  type TPhysicsBodyOptions,
  type TPhysicsCollision,
  type TPhysicsWorld,
} from './physics-world';
import * as CANNON from 'cannon-es';

export interface TCannonPhysicsObject {
  uuid: string;
  body: CANNON.Body;
}

export default class TCannonWorld implements TPhysicsWorld {
  private world!: CANNON.World;
  private objects: TCannonPhysicsObject[] = [];

  public collisions: TPhysicsCollision[] = [];

  private defaultCollisionClass!: string;
  private collisionClasses: {
    [key: string]: {
      groupNumber: number;
      mask?: number;
      ignoredBy: number[];
    };
  } = {};

  public async create(config: TWorldConfig): Promise<void> {
    const options: { gravity?: CANNON.Vec3 } = {};

    if (config.enableGravity) {
      options.gravity = new CANNON.Vec3(0, -9.82, 0);
    }

    this.defaultCollisionClass = config.defaultCollisionClass;

    // Setup collision classes
    let nextGroup = 1;
    for (const cc of config.collisionClasses) {
      let mask: number | undefined = undefined;

      if (cc.ignores) {
        for (const ig of cc.ignores) {
          // Find the group number
          const id = this.collisionClasses[ig];
          id.ignoredBy.push(nextGroup);

          if (mask === undefined) {
            mask = ~id;
          } else {
            mask &= ~id;
          }
        }
      }

      this.collisionClasses[cc.name] = {
        groupNumber: nextGroup,
        mask,
        ignoredBy: [],
      };

      nextGroup *= 2;
    }

    // Apply ignoredBy to masks
    for (const name in this.collisionClasses) {
      const cc = this.collisionClasses[name];
      for (const ig of cc.ignoredBy) {
        if (cc.mask === undefined) {
          cc.mask = ~ig;
        } else {
          cc.mask &= ~ig;
        }
      }
    }

    this.world = new CANNON.World(options);

    this.world.addEventListener(
      'beginContact',
      (e: { bodyA: CANNON.Body; bodyB: CANNON.Body }) => {
        const bodyAUUID = this.findUUID(e.bodyA.id);
        const bodyBUUID = this.findUUID(e.bodyB.id);

        if (!bodyAUUID || !bodyBUUID) return;

        // @todo collisions are going to be one frame behind?
        this.collisions.push({ bodies: [bodyAUUID, bodyBUUID] });
      }
    );
  }

  public step(delta: number): {
    bodies: TPhysicsBody[];
    collisions: TPhysicsCollision[];
  } {
    this.world.step(1 / 60, delta, 2);

    const bodies: TPhysicsBody[] = [];
    for (const obj of this.objects) {
      bodies.push({
        uuid: obj.uuid,
        translation: obj.body.position.toArray(),
        rotation: obj.body.quaternion.toArray(),
      });
    }

    const worldState = {
      bodies,
      collisions: [...this.collisions],
    };

    this.collisions = [];

    return worldState;
  }

  public addBody(
    uuid: string,
    collider: TColliderConfig,
    translation: [number, number, number],
    rotation: [number, number, number, number],
    mass: number,
    options?: TPhysicsBodyOptions
  ): void {
    let shape: CANNON.Shape;

    if (collider.type === TColliderType.BOX) {
      const config = collider as TBoxColliderConfig;
      shape = new CANNON.Box(
        new CANNON.Vec3(config.width / 2, config.depth / 2, config.height / 2)
      );
    } else if (collider.type === TColliderType.PLANE) {
      // @todo actually make this a plane
      const config = collider as TPlaneColliderConfig;
      shape = new CANNON.Box(
        new CANNON.Vec3(config.width / 2, 0.000001, config.height / 2)
      );
    } else if (collider.type === TColliderType.SPHERE) {
      const config = collider as TSphereColliderConfig;
      shape = new CANNON.Sphere(config.radius);
    } else {
      return;
    }

    const colliderFilter: {
      collisionFilterGroup?: number;
      collisionFilterMask?: number;
    } = {};

    if (collider.collisionClass) {
      const collisionClass = this.collisionClasses[collider.collisionClass];

      colliderFilter.collisionFilterGroup = collisionClass.groupNumber;
      colliderFilter.collisionFilterMask = collisionClass.mask;
    } else {
      const defaultClass = this.collisionClasses[this.defaultCollisionClass];
      colliderFilter.collisionFilterGroup = defaultClass.groupNumber;
      colliderFilter.collisionFilterMask = defaultClass.mask;
    }

    const body = new CANNON.Body({
      mass,
      shape,
      ...colliderFilter,
      fixedRotation: options?.fixedRotation,
      type: mapBodyType(options?.type),
      angularDamping: options?.angularDamping,
      linearDamping: options?.linearDamping,
      angularVelocity: convertVec3(options?.angularVelocity),
      velocity: convertVec3(options?.linearVelocity),
      isTrigger: options?.isTrigger,
    });
    body.position.set(...translation);
    body.quaternion.set(...rotation);

    if (options?.friction) {
      body.material = new CANNON.Material({ friction: options.friction });
    }

    this.world.addBody(body);
    this.objects.push({ uuid, body });
  }

  private findBody(uuid: string): CANNON.Body | undefined {
    // @todo this might not return a body
    return this.objects.find((body) => body.uuid === uuid)?.body;
  }

  private findUUID(id: number): string | undefined {
    // @todo this might not return a uuid
    return this.objects.find((obj) => obj.body.id === id)?.uuid;
  }

  public applyCentralForce(uuid: string, force: vec3): void {
    const body = this.findBody(uuid);
    body?.applyForce(new CANNON.Vec3(...force));
  }

  public applyCentralImpulse(uuid: string, impulse: vec3): void {
    const body = this.findBody(uuid);
    body?.applyImpulse(new CANNON.Vec3(...impulse));
  }

  public updateBodyOptions(uuid: string, options: TPhysicsBodyOptions): void {
    const body = this.findBody(uuid);
    if (!body) return;

    if (options.fixedRotation !== undefined) {
      body.fixedRotation = options.fixedRotation;
    }

    const mappedType = mapBodyType(options.type);
    if (mappedType) {
      body.type = mappedType;
    }

    if (options.angularDamping !== undefined) {
      body.angularDamping = options.angularDamping;
    }

    if (options.linearDamping !== undefined) {
      body.linearDamping = options.linearDamping;
    }

    if (options.angularVelocity !== undefined) {
      body.angularVelocity = new CANNON.Vec3(...options.angularVelocity);
    }

    if (options.linearVelocity !== undefined) {
      body.velocity = new CANNON.Vec3(...options.linearVelocity);
    }

    if (options.friction !== undefined) {
      if (body.material) {
        body.material.friction = options.friction;
      } else {
        body.material = new CANNON.Material({ friction: options.friction });
      }
    }

    if (options.isTrigger !== undefined) {
      body.isTrigger = options.isTrigger;
    }

    // Needs to be called after changing options
    body.updateMassProperties();
  }

  public updateTransform(
    uuid: string,
    translation: [number, number, number],
    rotation: [number, number, number, number]
  ) {
    const body = this.findBody(uuid);
    if (!body) return;

    body.position.set(...translation);
    body.quaternion.set(...rotation);
  }
}

function mapBodyType(
  type: TPhysicsBodyType | undefined
): CANNON.BodyType | undefined {
  if (type === undefined) {
    return undefined;
  }

  switch (type) {
    case TPhysicsBodyType.DYNAMIC:
      return CANNON.BODY_TYPES.DYNAMIC;
    case TPhysicsBodyType.STATIC:
      return CANNON.BODY_TYPES.STATIC;
  }
}

function convertVec3(vector?: vec3): CANNON.Vec3 | undefined {
  if (!vector) {
    return undefined;
  }

  return new CANNON.Vec3(...vector);
}
