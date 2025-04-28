import { createBoxMesh } from './box-component';
import TColorMaterial from '../graphics/color-material';

describe('createBoxMesh', () => {
  it('should create a box mesh with correct dimensions', () => {
    const width = 2;
    const height = 3;
    const depth = 4;
    const result = createBoxMesh(width, height, depth);

    // Check that we have both geometry and material
    expect(result.geometry).toBeDefined();
    expect(result.material).toBeDefined();
    expect(result.material).toBeInstanceOf(TColorMaterial);

    // Check that positions array has correct length (24 vertices * 3 coordinates = 72)
    expect(result.geometry.positions.length).toBe(72);

    // Check that normals array has correct length (24 vertices * 3 coordinates = 72)
    expect(result.geometry.normals.length).toBe(72);

    // Check that indexes array has correct length (6 faces * 2 triangles * 3 vertices = 36)
    expect(result.geometry.indexes.length).toBe(36);

    // Check that colors array has correct length (24 vertices)
    expect(result.geometry.colors.length).toBe(24);

    // Check that paletteIndex has all required faces
    expect(result.geometry.paletteIndex).toEqual({
      front: 0,
      back: 1,
      top: 2,
      bottom: 3,
      right: 4,
      left: 5,
    });
  });

  it('should create vertices at correct positions', () => {
    const width = 2;
    const height = 3;
    const depth = 4;
    const result = createBoxMesh(width, height, depth);

    // Check front face vertices (first 12 values)
    const positions = result.geometry.positions;
    expect(positions.slice(0, 12)).toEqual([
      -1,
      -1.5,
      2, // Front bottom left
      1,
      -1.5,
      2, // Front bottom right
      1,
      1.5,
      2, // Front top right
      -1,
      1.5,
      2, // Front top left
    ]);
  });

  it('should have correct face normals', () => {
    const result = createBoxMesh(1, 1, 1);
    const normals = result.geometry.normals;

    // Check front face normals (first 12 values)
    expect(normals.slice(0, 12)).toEqual([
      0,
      0,
      1, // Front face normal (pointing forward)
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      1,
    ]);

    // Check back face normals (next 12 values)
    expect(normals.slice(12, 24)).toEqual([
      0,
      0,
      -1, // Back face normal (pointing backward)
      0,
      0,
      -1,
      0,
      0,
      -1,
      0,
      0,
      -1,
    ]);
  });

  it('should have correct face colors in material palette', () => {
    const result = createBoxMesh(1, 1, 1);
    const material = result.material as TColorMaterial;

    expect(material.palette).toEqual({
      front: [1.0, 1.0, 1.0, 1.0], // White
      back: [1.0, 0.0, 0.0, 1.0], // Red
      top: [0.0, 1.0, 0.0, 1.0], // Green
      bottom: [0.0, 0.0, 1.0, 1.0], // Blue
      right: [1.0, 1.0, 0.0, 1.0], // Yellow
      left: [1.0, 0.0, 1.0, 1.0], // Purple
    });
  });

  it('should create correct triangle indices', () => {
    const result = createBoxMesh(1, 1, 1);
    const indexes = result.geometry.indexes;

    // Check first face (front) indices
    expect(indexes.slice(0, 6)).toEqual([0, 1, 2, 0, 2, 3]);

    // Check second face (back) indices
    expect(indexes.slice(6, 12)).toEqual([4, 5, 6, 4, 6, 7]);
  });
});
