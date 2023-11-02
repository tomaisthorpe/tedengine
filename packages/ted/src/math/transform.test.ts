import TTransform from './transform';
import { quat, vec3 } from 'gl-matrix';

test('scale should default to (1,1,1)', () => {
  const t = new TTransform();
  expect([...t.scale]).toEqual([1, 1, 1]);
});

test('getMatrix should output expected matrix', () => {
  const t = new TTransform(
    vec3.fromValues(1, 2, 3),
    quat.fromEuler(quat.create(), Math.PI, 0.5 * Math.PI, 2 * Math.PI),
    vec3.fromValues(0.5, 2, 4)
  );

  expect(t.getMatrix()).toMatchSnapshot();
});
