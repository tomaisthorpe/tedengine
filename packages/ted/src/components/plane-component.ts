import TColorMaterial from '../graphics/color-material';
import type { TMeshGeometry } from './mesh-component';

export function createPlaneMesh(
  width: number,
  height: number,
): { geometry: TMeshGeometry; material: TColorMaterial } {
  const x = width / 2.0;
  const z = height / 2.0;

  const positions = [
    // Top face
    -x,
    0,
    -z,
    -x,
    0,
    z,
    x,
    0,
    z,
    x,
    0,
    -z,
  ];

  const normals = [
    // Top
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
  ];

  const index = [
    0, // top
    1,
    2,
    3,
    0,
    2,
  ];

  // Convert the array of colors into a table for all the vertices.
  let colors: number[] = [];

  for (let i = 0; i < index.length; i++) {
    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(0);
  }

  const paletteIndex = {
    primary: 0,
  };

  const material = new TColorMaterial();
  material.palette = {
    primary: [0, 1, 0, 1],
  };

  return {
    geometry: { positions, normals, indexes: index, colors, paletteIndex },
    material,
  };
}
