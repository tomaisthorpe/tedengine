import type { TWorldConfig } from '../core/world';
import TCannonWorld from './cannon-world';
import { v4 as uuidv4 } from 'uuid';
import TBoxCollider from './colliders/box-collider';

const worldConfig: TWorldConfig = {
  enableGravity: false,
  defaultCollisionClass: 'Solid',
  collisionClasses: [{ name: 'Solid' }, { name: 'Other' }],
};

describe('create', () => {
  test('promise should resolve', async () => {
    const world = new TCannonWorld();
    await expect(world.create(worldConfig)).resolves.toBeUndefined();
  });
});

describe('queryLine', () => {
  let world: TCannonWorld;
  const bodyA = uuidv4();
  const bodyB = uuidv4();

  beforeEach(async () => {
    world = new TCannonWorld();
    await world.create(worldConfig);

    const colliderA = new TBoxCollider(1, 1, 1, 'Solid');
    world.addBody(bodyA, colliderA.getConfig(), [10, 0, 0], [0, 0, 0, 1], 1);

    const colliderB = new TBoxCollider(1, 1, 1, 'Other');
    world.addBody(bodyB, colliderB.getConfig(), [20, 0, 0], [0, 0, 0, 1], 1);

    world.step(1);
  });

  test('should return a single result', () => {
    const result = world.queryLine([0, 0.5, 0], [15, 0.5, 0]);

    expect(result).toHaveLength(1);
    expect(result).toContainEqual({ uuid: bodyA, distance: 9.5 });
  });

  test('should return two results', () => {
    const result = world.queryLine([0, 0.5, 0], [25, 0.5, 0]);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ uuid: bodyA, distance: 9.5 });
    expect(result).toContainEqual({ uuid: bodyB, distance: 19.5 });
  });

  test('should ignore collision class correctly', () => {
    const result = world.queryLine([0, 0.5, 0], [25, 0.5, 0], {
      collisionClasses: ['Other'],
    });

    expect(result).toHaveLength(1);
    expect(result).toContainEqual({ uuid: bodyB, distance: 19.5 });
  });

  test('should handle multiple collision classes correctly', () => {
    const result = world.queryLine([0, 0.5, 0], [25, 0.5, 0], {
      collisionClasses: ['Solid', 'Other'],
    });

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ uuid: bodyA, distance: 9.5 });
    expect(result).toContainEqual({ uuid: bodyB, distance: 19.5 });
  });
});

describe('queryArea', () => {
  let world: TCannonWorld;
  const bodyA = uuidv4();
  const bodyB = uuidv4();

  beforeEach(async () => {
    world = new TCannonWorld();
    await world.create(worldConfig);

    const colliderA = new TBoxCollider(1, 1, 1, 'Solid');
    world.addBody(bodyA, colliderA.getConfig(), [10, 0, 0], [0, 0, 0, 1], 1);

    const colliderB = new TBoxCollider(1, 1, 1, 'Other');
    world.addBody(bodyB, colliderB.getConfig(), [20, 0, 0], [0, 0, 0, 1], 1);

    world.step(1);
  });

  test('should return a single result', () => {
    const result = world.queryArea([0, 0, 0], [15, 1, 1]);

    expect(result).toHaveLength(1);
    expect(result).toContainEqual({ uuid: bodyA });
  });

  test('should return two results', () => {
    const result = world.queryArea([0, 0, 0], [25, 20, 20]);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ uuid: bodyA });
    expect(result).toContainEqual({ uuid: bodyB });
  });

  test('should ignore collision class correctly', () => {
    const result = world.queryArea([0, 0, 0], [25, 20, 20], {
      collisionClasses: ['Other'],
    });

    expect(result).toHaveLength(1);
    expect(result).toContainEqual({ uuid: bodyB });
  });

  test('should handle multiple collision classes correctly', () => {
    const result = world.queryArea([0, 0, 0], [25, 20, 20], {
      collisionClasses: ['Solid', 'Other'],
    });

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ uuid: bodyA });
    expect(result).toContainEqual({ uuid: bodyB });
  });
});
