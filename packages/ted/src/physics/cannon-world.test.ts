import type { TWorldConfig } from '../core/world';
import TCannonWorld from './cannon-world';
import { v4 as uuidv4 } from 'uuid';
import TBoxCollider from './colliders/box-collider';

const worldConfig: TWorldConfig = {
  enableGravity: true,
  defaultCollisionClass: 'Solid',
  collisionClasses: [{ name: 'Solid' }],
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

    const collider = new TBoxCollider(1, 1, 1);
    world.addBody(bodyA, collider.getConfig(), [10, 0, 0], [0, 0, 0, 1], 1);
    world.addBody(bodyB, collider.getConfig(), [20, 0, 0], [0, 0, 0, 1], 1);
  });

  test('queryLine should return a single result', () => {
    const result = world.queryLine([0, 0.5, 0], [15, 0.5, 0]);

    expect(result).toHaveLength(1);
    expect(result).toContainEqual({ uuid: bodyA, distance: 9.5 });
  });

  test('queryLine should return two results', () => {
    const result = world.queryLine([0, 0.5, 0], [25, 0.5, 0]);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ uuid: bodyA, distance: 9.5 });
    expect(result).toContainEqual({ uuid: bodyB, distance: 19.5 });
  });
});
