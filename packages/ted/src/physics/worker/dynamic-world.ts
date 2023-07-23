import Ammo from '@tomaisthorpe/ammojs-typed';
import type { vec3 } from 'gl-matrix';
import type { TColliderConfig } from '../colliders';
import { TColliderType } from '../colliders';
import type { TBoxColliderConfig } from '../colliders/box-collider';
import type { TPlaneColliderConfig } from '../colliders/plane-collider';
import type { TSphereColliderConfig } from '../colliders/sphere-collider';
import type { TWorldConfig } from '../world';

let ammo = Ammo;

export interface TPhysicsBody {
  uuid: string;
  translation: [number, number, number];
  rotation: [number, number, number, number];
}

export interface TPhysicsObject {
  uuid: string;
  body: Ammo.btRigidBody;
}

export default class TDynamicWorld {
  private world!: Ammo.btDiscreteDynamicsWorld;
  private interval!: ReturnType<typeof setInterval>;
  private objects: TPhysicsObject[] = [];

  constructor(private onWorldUpdate: (bodies: TPhysicsBody[]) => void) {}

  public async create(config: TWorldConfig): Promise<void> {
    ammo = await ammo.bind(globalThis)();

    const collisionConfiguration = new ammo.btDefaultCollisionConfiguration();
    const dispatcher = new ammo.btCollisionDispatcher(collisionConfiguration);
    const overlappingPairCache = new ammo.btDbvtBroadphase();
    const solver = new ammo.btSequentialImpulseConstraintSolver();
    this.world = new ammo.btDiscreteDynamicsWorld(
      dispatcher,
      overlappingPairCache as any,
      solver,
      collisionConfiguration
    );

    if (config.enableGravity) {
      this.world.setGravity(new ammo.btVector3(0, -10, 0));
    }
  }

  public simulateStep(delta: number) {
    this.simulate(delta);
  }

  private simulate(dt: number) {
    this.world.stepSimulation(dt, 2);

    const worldState: TPhysicsBody[] = [];

    for (const obj of this.objects) {
      const transform = new ammo.btTransform();
      obj.body.getMotionState().getWorldTransform(transform);
      const origin = transform.getOrigin();
      const rotation = transform.getRotation();

      worldState.push({
        uuid: obj.uuid,
        translation: [origin.x(), origin.y(), origin.z()],
        rotation: [rotation.x(), rotation.y(), rotation.z(), rotation.w()],
      });
    }

    this.onWorldUpdate(worldState);
  }

  public addBody(
    uuid: string,
    collider: TColliderConfig,
    translation: [number, number, number],
    rotation: [number, number, number, number],
    mass: number
  ) {
    const startingTransform = new ammo.btTransform();
    startingTransform.setIdentity();
    startingTransform.setOrigin(new ammo.btVector3(...translation));
    startingTransform.setRotation(new ammo.btQuaternion(...rotation));

    const localInertia = new ammo.btVector3(0, 0, 0);

    let shape: Ammo.btCollisionShape;

    if (collider.type === TColliderType.BOX) {
      const config = collider as TBoxColliderConfig;
      shape = new ammo.btBoxShape(
        new ammo.btVector3(
          config.width / 2,
          config.depth / 2,
          config.height / 2
        )
      );
    } else if (collider.type === TColliderType.PLANE) {
      const config = collider as TPlaneColliderConfig;
      shape = new ammo.btBoxShape(
        new ammo.btVector3(config.width / 2, 0.000001, config.height / 2)
      );
    } else if (collider.type === TColliderType.SPHERE) {
      const config = collider as TSphereColliderConfig;
      shape = new ammo.btSphereShape(config.radius);
    } else {
      return;
    }

    shape.calculateLocalInertia(mass, localInertia);

    const motionState = new ammo.btDefaultMotionState(startingTransform);
    const rbInfo = new ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      shape,
      localInertia
    );
    const body = new ammo.btRigidBody(rbInfo);
    this.world.addRigidBody(body);

    this.objects.push({
      uuid,
      body,
    });
  }

  private findBody(uuid: string): Ammo.btRigidBody | undefined {
    // @todo this might not return a body
    return this.objects.find((body) => body.uuid === uuid)?.body;
  }

  public applyCentralForce(uuid: string, force: vec3) {
    const body = this.findBody(uuid);
    body?.activate(true);

    const btForce = new ammo.btVector3(force[0], force[1], force[2]);
    body?.applyCentralForce(btForce);
  }

  public applyCentralImpulse(uuid: string, impulse: vec3) {
    const body = this.findBody(uuid);
    body?.activate(true);

    const btImpulse = new ammo.btVector3(impulse[0], impulse[1], impulse[2]);
    body?.applyCentralImpulse(btImpulse);
  }
}
