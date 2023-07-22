import OBJFile from './obj-file-parser/obj-file';

interface Vertex {
  x: number;
  y: number;
  z: number;
}

export default class OBJParser {
  public static parse(content: string) {
    let vertices: Vertex[] = [];
    let normals: Vertex[] = [];
    const unpacked: {
      colors: number[];
      index: number;
      indices: number[];
      indicesLookup: { [key: string]: number };
      normals: number[];
      vertices: number[];
      palette: { [key: string]: number };
    } = {
      palette: {},
      colors: [],
      index: 0,
      indices: [],
      indicesLookup: {},
      normals: [],
      vertices: [],
    };

    let paletteCount = 0;
    const obj = new OBJFile(content).parse();

    for (const model of obj.models) {
      vertices = vertices.concat(model.vertices);
      normals = normals.concat(model.vertexNormals);

      for (const face of model.faces) {
        let color = paletteCount;
        if (unpacked.palette[face.material] !== undefined) {
          color = unpacked.palette[face.material];
        } else {
          unpacked.palette[face.material] = color;
          paletteCount++;
        }

        // A face will contain 4 vertices if quad.
        // To fix this, the vertices array needs adjusting.
        if (face.vertices.length === 4) {
          const v = face.vertices;
          face.vertices = [v[0], v[1], v[2], v[2], v[3], v[0]];
        }

        for (const vertex of face.vertices) {
          const hash = `${vertex.vertexIndex}-${vertex.vertexNormalIndex}-${color}`;

          if (hash in unpacked.indicesLookup) {
            unpacked.indices.push(unpacked.indicesLookup[hash]);
          } else {
            // Get vertex and normal
            const vert = vertices[vertex.vertexIndex - 1];
            const normal = normals[vertex.vertexNormalIndex - 1];

            unpacked.vertices.push(vert.x as number);
            unpacked.vertices.push(vert.y as number);
            unpacked.vertices.push(vert.z as number);
            unpacked.normals.push(normal.x as number);
            unpacked.normals.push(normal.y as number);
            unpacked.normals.push(normal.z as number);
            unpacked.indices.push(unpacked.index);
            unpacked.colors.push(color);

            unpacked.indicesLookup[hash] = unpacked.index;
            unpacked.index += 1;
          }
        }
      }
    }

    return {
      palette: unpacked.palette,
      colors: unpacked.colors,
      indices: unpacked.indices,
      normals: unpacked.normals,
      vertices: unpacked.vertices,
    };
  }
}
