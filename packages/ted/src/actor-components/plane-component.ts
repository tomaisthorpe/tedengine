import type TActor from '../core/actor';
import type TEngine from '../engine/engine';
import type { TColor } from '../graphics/color-material';
import TColorMaterial from '../graphics/color-material';
import type { TPhysicsBodyOptions } from '../physics/physics-world';
import TMeshComponent from './mesh-component';

export default class TPlaneComponent extends TMeshComponent {
  constructor(
    engine: TEngine,
    actor: TActor,
    public width: number,
    public height: number,
    bodyOptions?: TPhysicsBodyOptions
  ) {
    super(engine, actor, bodyOptions);

    this.generateMesh();
  }

  private generateMesh() {
    const x = this.width / 2.0;
    const z = this.height / 2.0;

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

    this.setMesh(this.engine, positions, normals, index, colors, paletteIndex);

    // Green
    this.setColor([0, 1, 0, 1]);
  }

  public setColor(color: TColor) {
    const material = new TColorMaterial();
    material.palette = {
      primary: color,
    };

    this.setMaterial(material);
  }
}
