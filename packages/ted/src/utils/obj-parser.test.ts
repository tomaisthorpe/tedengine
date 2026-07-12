import { OBJParser } from './obj-parser';

describe('OBJParser', () => {
  it('uses neutral texture coordinates when a face has no UVs', () => {
    const obj = `
v 0 0 0
v 1 0 0
v 0 1 0
vn 0 0 1
f 1//1 2//1 3//1
`;

    const result = OBJParser.parse(obj);

    expect(result.uvs).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it('keeps vertices with different texture coordinates separate', () => {
    const obj = `
v 0 0 0
v 1 0 0
v 0 1 0
vt 0 0
vt 1 1
vn 0 0 1
f 1/1/1 2/1/1 3/1/1
f 1/2/1 3/1/1 2/1/1
`;

    const result = OBJParser.parse(obj);

    expect(result.vertices).toHaveLength(12);
    expect(result.uvs).toEqual([0, 0, 0, 0, 0, 0, 1, 1]);
  });
});
