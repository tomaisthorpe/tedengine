import type { TWorldConfig } from '../core/world';
import TCannonWorld from './cannon-world';

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
