import { OBJFile } from './obj-file';

describe('OBJFile', () => {
  describe('parse', () => {
    it('should parse vertices', () => {
      const obj = `
v 1.0 2.0 3.0
v 4.0 5.0 6.0
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models).toHaveLength(1);
      expect(result.models[0].vertices).toHaveLength(2);
      expect(result.models[0].vertices[0]).toEqual({ x: 1.0, y: 2.0, z: 3.0 });
      expect(result.models[0].vertices[1]).toEqual({ x: 4.0, y: 5.0, z: 6.0 });
    });

    it('should parse texture coordinates', () => {
      const obj = `
vt 0.5 0.5
vt 1.0 0.0 0.5
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models[0].textureCoords).toHaveLength(2);
      expect(result.models[0].textureCoords[0]).toEqual({ u: 0.5, v: 0.5, w: 0.0 });
      expect(result.models[0].textureCoords[1]).toEqual({ u: 1.0, v: 0.0, w: 0.5 });
    });

    it('should parse vertex normals', () => {
      const obj = `
vn 0.0 1.0 0.0
vn 1.0 0.0 0.0
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models[0].vertexNormals).toHaveLength(2);
      expect(result.models[0].vertexNormals[0]).toEqual({ x: 0.0, y: 1.0, z: 0.0 });
      expect(result.models[0].vertexNormals[1]).toEqual({ x: 1.0, y: 0.0, z: 0.0 });
    });

    it('should parse simple faces with vertex indices only', () => {
      const obj = `
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 0.0 1.0 0.0
f 1 2 3
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models[0].faces).toHaveLength(1);
      expect(result.models[0].faces[0].vertices).toHaveLength(3);
      expect(result.models[0].faces[0].vertices[0].vertexIndex).toBe(1);
      expect(result.models[0].faces[0].vertices[1].vertexIndex).toBe(2);
      expect(result.models[0].faces[0].vertices[2].vertexIndex).toBe(3);
    });

    it('should parse faces with vertex and texture indices', () => {
      const obj = `
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 0.0 1.0 0.0
vt 0.0 0.0
vt 1.0 0.0
vt 0.0 1.0
f 1/1 2/2 3/3
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models[0].faces).toHaveLength(1);
      expect(result.models[0].faces[0].vertices[0]).toMatchObject({
        vertexIndex: 1,
        textureCoordsIndex: 1,
        vertexNormalIndex: 0,
      });
    });

    it('should parse faces with vertex, texture, and normal indices', () => {
      const obj = `
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 0.0 1.0 0.0
vt 0.0 0.0
vt 1.0 0.0
vt 0.0 1.0
vn 0.0 0.0 1.0
vn 0.0 0.0 1.0
vn 0.0 0.0 1.0
f 1/1/1 2/2/2 3/3/3
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models[0].faces[0].vertices[0]).toMatchObject({
        vertexIndex: 1,
        textureCoordsIndex: 1,
        vertexNormalIndex: 1,
      });
    });

    it('should parse faces with vertex and normal indices (no texture)', () => {
      const obj = `
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 0.0 1.0 0.0
vn 0.0 0.0 1.0
vn 0.0 0.0 1.0
vn 0.0 0.0 1.0
f 1//1 2//2 3//3
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models[0].faces[0].vertices[0]).toMatchObject({
        vertexIndex: 1,
        textureCoordsIndex: 0,
        vertexNormalIndex: 1,
      });
    });

    it('should handle negative vertex indices (relative references)', () => {
      const obj = `
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 0.0 1.0 0.0
v 1.0 1.0 0.0
f -4 -3 -2
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models[0].faces[0].vertices[0].vertexIndex).toBe(1);
      expect(result.models[0].faces[0].vertices[1].vertexIndex).toBe(2);
      expect(result.models[0].faces[0].vertices[2].vertexIndex).toBe(3);
    });

    it('should parse quads (4 vertices)', () => {
      const obj = `
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 1.0 1.0 0.0
v 0.0 1.0 0.0
f 1 2 3 4
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models[0].faces[0].vertices).toHaveLength(4);
    });

    it('should parse object declarations', () => {
      const obj = `
o Cube
v 0.0 0.0 0.0
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models).toHaveLength(1);
      expect(result.models[0].name).toBe('Cube');
    });

    it('should parse multiple objects', () => {
      const obj = `
o Object1
v 0.0 0.0 0.0

o Object2
v 1.0 1.0 1.0
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models).toHaveLength(2);
      expect(result.models[0].name).toBe('Object1');
      expect(result.models[1].name).toBe('Object2');
    });

    it('should use default object name when no object declaration', () => {
      const obj = `
v 0.0 0.0 0.0
`;
      const parser = new OBJFile(obj, 'DefaultName');
      const result = parser.parse();

      expect(result.models[0].name).toBe('DefaultName');
    });

    it('should parse group declarations', () => {
      const obj = `
g group1
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 0.0 1.0 0.0
f 1 2 3
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models[0].faces[0].group).toBe('group1');
    });

    it('should parse material library references', () => {
      const obj = `
mtllib materials.mtl
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.materialLibraries).toHaveLength(1);
      expect(result.materialLibraries[0]).toBe('materials.mtl');
    });

    it('should parse material usage', () => {
      const obj = `
usemtl Material1
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 0.0 1.0 0.0
f 1 2 3
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models[0].faces[0].material).toBe('Material1');
    });

    it('should parse smoothing groups', () => {
      const obj = `
s 1
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 0.0 1.0 0.0
f 1 2 3
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models[0].faces[0].smoothingGroup).toBe(1);
    });

    it('should parse smoothing group off', () => {
      const obj = `
s off
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 0.0 1.0 0.0
f 1 2 3
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models[0].faces[0].smoothingGroup).toBe(0);
    });

    it('should strip comments', () => {
      const obj = `
# This is a comment
v 1.0 2.0 3.0 # vertex comment
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models[0].vertices).toHaveLength(1);
      expect(result.models[0].vertices[0]).toEqual({ x: 1.0, y: 2.0, z: 3.0 });
    });

    it('should parse complex OBJ file', () => {
      const obj = `
# Test OBJ file
mtllib test.mtl

o Cube
v -1.0 -1.0 1.0
v 1.0 -1.0 1.0
v -1.0 1.0 1.0
v 1.0 1.0 1.0

vn 0.0 0.0 1.0
vn 0.0 0.0 1.0
vn 0.0 0.0 1.0
vn 0.0 0.0 1.0

vt 0.0 0.0
vt 1.0 0.0
vt 0.0 1.0
vt 1.0 1.0

g front
usemtl Material1
s 1
f 1/1/1 2/2/2 4/4/4 3/3/3
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models).toHaveLength(1);
      expect(result.models[0].name).toBe('Cube');
      expect(result.models[0].vertices).toHaveLength(4);
      expect(result.models[0].textureCoords).toHaveLength(4);
      expect(result.models[0].vertexNormals).toHaveLength(4);
      expect(result.models[0].faces).toHaveLength(1);
      expect(result.models[0].faces[0].vertices).toHaveLength(4);
      expect(result.models[0].faces[0].material).toBe('Material1');
      expect(result.models[0].faces[0].group).toBe('front');
      expect(result.models[0].faces[0].smoothingGroup).toBe(1);
      expect(result.materialLibraries[0]).toBe('test.mtl');
    });

    it('should handle incomplete vertex data with defaults', () => {
      const obj = `
v 1.0
v 1.0 2.0
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models[0].vertices[0]).toEqual({ x: 1.0, y: 0.0, z: 0.0 });
      expect(result.models[0].vertices[1]).toEqual({ x: 1.0, y: 2.0, z: 0.0 });
    });
  });

  describe('error handling', () => {
    it('should throw error for face with less than 3 vertices', () => {
      const obj = `
v 0.0 0.0 0.0
v 1.0 0.0 0.0
f 1 2
`;
      const parser = new OBJFile(obj);

      expect(() => parser.parse()).toThrow('Face statement has less than 3 vertices');
    });

    it('should throw error for invalid vertex index 0', () => {
      const obj = `
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 0.0 1.0 0.0
f 0 1 2
`;
      const parser = new OBJFile(obj);

      expect(() => parser.parse()).toThrow('Face uses invalid vertex index of 0');
    });

    it('should throw error for group with wrong number of arguments', () => {
      const obj = `
g group1 group2
`;
      const parser = new OBJFile(obj);

      expect(() => parser.parse()).toThrow('Group statements must have exactly 1 argument');
    });

    it('should throw error for smoothing group with wrong number of arguments', () => {
      const obj = `
s 1 2
`;
      const parser = new OBJFile(obj);

      expect(() => parser.parse()).toThrow('Smoothing group statements must have exactly 1 argument');
    });

    it('should throw error for vertex with too many indices', () => {
      const obj = `
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 0.0 1.0 0.0
f 1/1/1/1 2/2/2/2 3/3/3/3
`;
      const parser = new OBJFile(obj);

      expect(() => parser.parse()).toThrow('Too many values (separated by /) for a single vertex');
    });
  });

  describe('default values', () => {
    it('should use empty string for material when not set', () => {
      const obj = `
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 0.0 1.0 0.0
f 1 2 3
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models[0].faces[0].material).toBe('');
    });

    it('should use empty string for group when not set', () => {
      const obj = `
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 0.0 1.0 0.0
f 1 2 3
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models[0].faces[0].group).toBe('');
    });

    it('should use 0 for smoothing group when not set', () => {
      const obj = `
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 0.0 1.0 0.0
f 1 2 3
`;
      const parser = new OBJFile(obj);
      const result = parser.parse();

      expect(result.models[0].faces[0].smoothingGroup).toBe(0);
    });
  });
});
