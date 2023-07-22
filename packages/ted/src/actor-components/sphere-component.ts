import type TActor from '../core/actor';
import type TEngine from '../engine/engine';
import TColorMaterial from '../graphics/color-material';
import type { TColor } from '../graphics/color-material';
import TMeshComponent from './mesh-component';

export default class TSphereComponent extends TMeshComponent {
  constructor(
    engine: TEngine,
    actor: TActor,
    public radius: number,
    public latitudes: number,
    public longitudes: number
  ) {
    super(engine, actor);

    this.generateMesh();
  }

  private generateMesh() {
    const positions: number[] = [];
    const normals: number[] = [];
    const index: number[] = [];

    const lengthInv = 1 / this.radius;
    const deltaLatitude = Math.PI / this.latitudes;
    const deltaLongitude = (2 * Math.PI) / this.longitudes;

    for (let i = 0; i <= this.latitudes; i++) {
      const latitudeAngle = Math.PI / 2 - i * deltaLatitude;
      const xy = this.radius * Math.cos(latitudeAngle);
      const z = this.radius * Math.sin(latitudeAngle);

      for (let j = 0; j <= this.longitudes; j++) {
        const longitudeAngle = j * deltaLongitude;

        const x = xy * Math.cos(longitudeAngle);
        const y = xy * Math.sin(longitudeAngle);
        positions.push(x, z, y);

        // normals.push(0, 0, 0);
        normals.push(x * lengthInv, z * lengthInv, y * lengthInv);
      }
    }

    for (let i = 0; i < this.latitudes; i++) {
      let k1 = i * (this.longitudes + 1);
      let k2 = k1 + this.longitudes + 1;

      for (let j = 0; j < this.longitudes; j++) {
        if (i !== 0) {
          index.push(k1, k2, k1 + 1);
        }

        if (i !== this.latitudes - 1) {
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

    this.setMesh(this.engine, positions, normals, index, colors, paletteIndex);

    this.setColor([1, 1, 0, 1]);
  }

  public setColor(color: TColor) {
    const material = new TColorMaterial();
    material.palette = {
      primary: color,
    };

    this.setMaterial(material);
  }
}
