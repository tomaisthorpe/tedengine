import type { vec3 } from 'gl-matrix';
import type { TColliderConfig } from '../colliders';
import { TColliderType } from '../colliders';
import type { TBoxColliderConfig } from '../colliders/box-collider';
import type { TPlaneColliderConfig } from '../colliders/plane-collider';
import type { TSphereColliderConfig } from '../colliders/sphere-collider';
import type { TWorldConfig } from '../world';
import type { TPhysicsBody, TPhysicsWorld } from './physics-world';
import * as CANNON from 'cannon-es';

export interface TCannonPhysicsObject {
  uuid: string;
  body: CANNON.Body;
}

export default class TCannonWorld implements TPhysicsWorld {
  private world!: CANNON.World;
  private objects: TCannonPhysicsObject[] = [];

  constructor(private onWorldUpdate: (bodies: TPhysicsBody[]) => void) {}

  public async create(config: TWorldConfig): Promise<void> {
    const options: { gravity?: CANNON.Vec3 } = {};

    if (config.enableGravity) {
      options.gravity = new CANNON.Vec3(0, -9.82, 0);
    }

    this.world = new CANNON.World(options);
  }

  public step(delta: number) {
    this.world.step(1 / 60, delta, 2);

    const worldState: TPhysicsBody[] = [];
    for (const obj of this.objects) {
      worldState.push({
        uuid: obj.uuid,
        translation: obj.body.position.toArray(),
        rotation: obj.body.quaternion.toArray(),
      });
    }

    this.onWorldUpdate(worldState);

    console.log('it work');
  }

  public addBody(
    uuid: string,
    collider: TColliderConfig,
    translation: [number, number, number],
    rotation: [number, number, number, number],
    mass: number
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

    const body = new CANNON.Body({ mass, shape });
    body.position.set(...translation);
    body.quaternion.set(...rotation);

    this.world.addBody(body);
    this.objects.push({ uuid, body });
  }

  private findBody(uuid: string): CANNON.Body | undefined {
    // @todo this might not return a body
    return this.objects.find((body) => body.uuid === uuid)?.body;
  }

  public applyCentralForce(uuid: string, force: vec3): void {
    const body = this.findBody(uuid);
    body?.applyForce(new CANNON.Vec3(...force));
  }

  public applyCentralImpulse(uuid: string, impulse: vec3): void {
    const body = this.findBody(uuid);
    body?.applyImpulse(new CANNON.Vec3(...impulse));
  }
}
