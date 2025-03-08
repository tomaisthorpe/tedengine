import TColorMaterial from '../graphics/color-material';
import type { TMeshGeometry } from './mesh-component';

export function createSphereMesh(
  radius: number,
  latitudes: number,
  longitudes: number,
): { geometry: TMeshGeometry; material: TColorMaterial } {
  const positions: number[] = [];
  const normals: number[] = [];
  const index: number[] = [];

  const lengthInv = 1 / radius;
  const deltaLatitude = Math.PI / latitudes;
  const deltaLongitude = (2 * Math.PI) / longitudes;

  for (let i = 0; i <= latitudes; i++) {
    const latitudeAngle = Math.PI / 2 - i * deltaLatitude;
    const xy = radius * Math.cos(latitudeAngle);
    const z = radius * Math.sin(latitudeAngle);

    for (let j = 0; j <= longitudes; j++) {
      const longitudeAngle = j * deltaLongitude;

      const x = xy * Math.cos(longitudeAngle);
      const y = xy * Math.sin(longitudeAngle);
      positions.push(x, z, y);

      normals.push(x * lengthInv, z * lengthInv, y * lengthInv);
    }
  }

  for (let i = 0; i < latitudes; i++) {
    let k1 = i * (longitudes + 1);
    let k2 = k1 + longitudes + 1;

    for (let j = 0; j < longitudes; j++) {
      if (i !== 0) {
        index.push(k1, k2, k1 + 1);
      }

      if (i !== latitudes - 1) {
        index.push(k1 + 1, k2, k2 + 1);
      }

      k1++;
      k2++;
    }
  }

  const num = index.length / 3;

  let colors: number[] = [];
  for (let i = 0; i < num; i++) {
    colors = colors.concat(0);
  }

  const paletteIndex = {
    primary: 0,
  };

  const material = new TColorMaterial();
  material.palette = {
    primary: [1.0, 1.0, 0.0, 1.0],
  };

  const geometry: TMeshGeometry = {
    positions,
    normals,
    indexes: index,
    colors,
    paletteIndex,
  };

  return { geometry, material };
}
