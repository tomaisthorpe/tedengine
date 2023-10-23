import type TActor from '../core/actor';
import type TEngine from '../engine/engine';
import type { TColor } from '../graphics/color-material';
import TColorMaterial from '../graphics/color-material';
import type { TPhysicsBodyOptions } from '../physics/physics-world';
import TMeshComponent from './mesh-component';

export default class TBoxComponent extends TMeshComponent {
  constructor(
    engine: TEngine,
    actor: TActor,
    public width: number,
    public height: number,
    public depth: number,
    bodyOptions?: TPhysicsBodyOptions
  ) {
    super(engine, actor, bodyOptions);

    this.generateMesh();
  }

  private generateMesh() {
    const x = this.width / 2.0;
    const y = this.height / 2.0;
    const z = this.depth / 2.0;

    const positions = [
      // Front face
      -x,
      -y,
      z,
      x,
      -y,
      z,
      x,
      y,
      z,
      -x,
      y,
      z,

      // Back face
      -x,
      -y,
      -z,
      -x,
      y,
      -z,
      x,
      y,
      -z,
      x,
      -y,
      -z,

      // Top face
      -x,
      y,
      -z,
      -x,
      y,
      z,
      x,
      y,
      z,
      x,
      y,
      -z,

      // Bottom face
      -x,
      -y,
      -z,
      x,
      -y,
      -z,
      x,
      -y,
      z,
      -x,
      -y,
      z,

      // Right face
      x,
      -y,
      -z,
      x,
      y,
      -z,
      x,
      y,
      z,
      x,
      -y,
      z,

      // Left face
      -x,
      -y,
      -z,
      -x,
      -y,
      z,
      -x,
      y,
      z,
      -x,
      y,
      -z,
    ];

    const normals = [
      // Front
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

      // Back
      0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,

      // Top
      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

      // Bottom
      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

      // Right
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

      // Left
      -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    ];

    const index = [
      0,
      1,
      2,
      0,
      2,
      3, // front
      4,
      5,
      6,
      4,
      6,
      7, // back
      8,
      9,
      10,
      8,
      10,
      11, // top
      12,
      13,
      14,
      12,
      14,
      15, // bottom
      16,
      17,
      18,
      16,
      18,
      19, // right
      20,
      21,
      22,
      20,
      22,
      23, // left
    ];

    // Convert the array of colors into a table for all the vertices.
    let colors: number[] = [];

    for (let i = 0; i < 6; i++) {
      // Repeat each color four times for the four vertices of the face
      colors = colors.concat(i, i, i, i);
    }

    const paletteIndex = {
      front: 0,
      back: 1,
      top: 2,
      bottom: 3,
      right: 4,
      left: 5,
    };

    this.setMesh(this.engine, positions, normals, index, colors, paletteIndex);

    this.setColors({
      front: [1.0, 1.0, 1.0, 1.0], // Front face: white
      back: [1.0, 0.0, 0.0, 1.0], // Back face: red
      top: [0.0, 1.0, 0.0, 1.0], // Top face: green
      bottom: [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
      right: [1.0, 1.0, 0.0, 1.0], // Right face: yellow
      left: [1.0, 0.0, 1.0, 1.0], // Left face: purple
    });
  }

  public setColors(palette: {
    front: TColor;
    back: TColor;
    top: TColor;
    bottom: TColor;
    right: TColor;
    left: TColor;
  }) {
    const material = new TColorMaterial();
    material.palette = palette;

    this.setMaterial(material);
  }

  public setColor(color: TColor) {
    this.setColors({
      front: color,
      back: color,
      top: color,
      bottom: color,
      right: color,
      left: color,
    });
  }
}
