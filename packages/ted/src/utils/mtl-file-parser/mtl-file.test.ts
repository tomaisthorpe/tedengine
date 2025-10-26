import { MTLFile } from './mtl-file';

describe('MTLFile', () => {
  describe('parse', () => {
    it('should parse a simple material with Kd', () => {
      const mtl = `
newmtl TestMaterial
Kd 0.8 0.2 0.1
`;
      const parser = new MTLFile(mtl);
      const materials = parser.parse();

      expect(materials).toHaveLength(1);
      expect(materials[0].name).toBe('TestMaterial');
      expect(materials[0].Kd.red).toBe(0.8);
      expect(materials[0].Kd.green).toBe(0.2);
      expect(materials[0].Kd.blue).toBe(0.1);
    });

    it('should parse multiple materials', () => {
      const mtl = `
newmtl Material1
Kd 1.0 0.0 0.0

newmtl Material2
Kd 0.0 1.0 0.0
`;
      const parser = new MTLFile(mtl);
      const materials = parser.parse();

      expect(materials).toHaveLength(2);
      expect(materials[0].name).toBe('Material1');
      expect(materials[1].name).toBe('Material2');
    });

    it('should parse Ka (ambient color)', () => {
      const mtl = `
newmtl TestMaterial
Ka 0.5 0.5 0.5
`;
      const parser = new MTLFile(mtl);
      const materials = parser.parse();

      expect(materials[0].Ka.red).toBe(0.5);
      expect(materials[0].Ka.green).toBe(0.5);
      expect(materials[0].Ka.blue).toBe(0.5);
    });

    it('should parse Ks (specular reflectance)', () => {
      const mtl = `
newmtl TestMaterial
Ks 0.9 0.9 0.9
`;
      const parser = new MTLFile(mtl);
      const materials = parser.parse();

      expect(materials[0].Ks.red).toBe(0.9);
      expect(materials[0].Ks.green).toBe(0.9);
      expect(materials[0].Ks.blue).toBe(0.9);
    });

    it('should parse illum (illumination model)', () => {
      const mtl = `
newmtl TestMaterial
illum 2
`;
      const parser = new MTLFile(mtl);
      const materials = parser.parse();

      expect(materials[0].illum).toBe(2);
    });

    it('should parse d (dissolve/opacity)', () => {
      const mtl = `
newmtl TestMaterial
d 0.7
`;
      const parser = new MTLFile(mtl);
      const materials = parser.parse();

      expect(materials[0].dissolve).toBe(0.7);
    });

    it('should parse Tr (transparency) as inverted dissolve', () => {
      const mtl = `
newmtl TestMaterial
Tr 0.3
`;
      const parser = new MTLFile(mtl);
      const materials = parser.parse();

      expect(materials[0].dissolve).toBe(0.7); // 1.0 - 0.3
    });

    it('should parse map_Kd (diffuse texture)', () => {
      const mtl = `
newmtl TestMaterial
map_Kd texture.png
`;
      const parser = new MTLFile(mtl);
      const materials = parser.parse();

      expect(materials[0].map_Kd.file).toBe('texture.png');
    });

    it('should parse map_Ka (ambient texture)', () => {
      const mtl = `
newmtl TestMaterial
map_Ka ambient.png
`;
      const parser = new MTLFile(mtl);
      const materials = parser.parse();

      expect(materials[0].map_Ka.file).toBe('ambient.png');
    });

    it('should parse map_Ks (specular texture)', () => {
      const mtl = `
newmtl TestMaterial
map_Ks specular.png
`;
      const parser = new MTLFile(mtl);
      const materials = parser.parse();

      expect(materials[0].map_Ks.file).toBe('specular.png');
    });

    it('should parse map_d (alpha/opacity texture)', () => {
      const mtl = `
newmtl TestMaterial
map_d alpha.png
`;
      const parser = new MTLFile(mtl);
      const materials = parser.parse();

      expect(materials[0].map_d.file).toBe('alpha.png');
    });

    it('should strip comments from lines', () => {
      const mtl = `
newmtl TestMaterial # This is a comment
Kd 0.5 0.5 0.5 # Another comment
`;
      const parser = new MTLFile(mtl);
      const materials = parser.parse();

      expect(materials[0].name).toBe('TestMaterial');
      expect(materials[0].Kd.red).toBe(0.5);
    });

    it('should ignore blank lines', () => {
      const mtl = `

newmtl TestMaterial

Kd 0.5 0.5 0.5

`;
      const parser = new MTLFile(mtl);
      const materials = parser.parse();

      expect(materials).toHaveLength(1);
    });

    it('should use default material name when no newmtl statement', () => {
      const mtl = `
Kd 0.5 0.5 0.5
`;
      const parser = new MTLFile(mtl);
      const materials = parser.parse('MyDefault');

      expect(materials).toHaveLength(1);
      expect(materials[0].name).toBe('MyDefault');
    });

    it('should parse complex MTL file with multiple properties', () => {
      const mtl = `
newmtl Material1
Ka 0.2 0.2 0.2
Kd 0.8 0.8 0.8
Ks 1.0 1.0 1.0
illum 2
d 1.0
map_Kd texture1.png

newmtl Material2
Ka 0.1 0.1 0.1
Kd 0.5 0.3 0.1
Ks 0.5 0.5 0.5
illum 1
d 0.9
map_Kd texture2.png
map_Ka ambient2.png
`;
      const parser = new MTLFile(mtl);
      const materials = parser.parse();

      expect(materials).toHaveLength(2);

      expect(materials[0].name).toBe('Material1');
      expect(materials[0].Ka.red).toBe(0.2);
      expect(materials[0].Kd.red).toBe(0.8);
      expect(materials[0].Ks.red).toBe(1.0);
      expect(materials[0].illum).toBe(2);
      expect(materials[0].dissolve).toBe(1.0);
      expect(materials[0].map_Kd.file).toBe('texture1.png');

      expect(materials[1].name).toBe('Material2');
      expect(materials[1].Kd.green).toBe(0.3);
      expect(materials[1].map_Ka.file).toBe('ambient2.png');
    });
  });

  describe('error handling', () => {
    it('should throw error when newmtl has no name', () => {
      const mtl = `newmtl`;
      const parser = new MTLFile(mtl);

      expect(() => parser.parse()).toThrow('newmtl statement must specify a name for the material');
    });

    it('should throw error when illum has no value', () => {
      const mtl = `
newmtl TestMaterial
illum
`;
      const parser = new MTLFile(mtl);

      expect(() => parser.parse()).toThrow('to few arguments, expected: illum <number>');
    });

    it('should throw error when d has no value', () => {
      const mtl = `
newmtl TestMaterial
d
`;
      const parser = new MTLFile(mtl);

      expect(() => parser.parse()).toThrow('to few arguments, expected: d <factor>');
    });

    it('should throw error when Tr has no value', () => {
      const mtl = `
newmtl TestMaterial
Tr
`;
      const parser = new MTLFile(mtl);

      expect(() => parser.parse()).toThrow('to few arguments, expected: Tr <factor>');
    });

    it('should throw error when map_Kd has no filename', () => {
      const mtl = `
newmtl TestMaterial
map_Kd
`;
      const parser = new MTLFile(mtl);

      expect(() => parser.parse()).toThrow('to few arguments, expected: map_Kd <textureImageFile>');
    });
  });

  describe('stripComments', () => {
    it('should remove comments from line', () => {
      const result = MTLFile._stripComments('newmtl Material # comment');
      expect(result).toBe('newmtl Material ');
    });

    it('should return full line when no comment', () => {
      const result = MTLFile._stripComments('newmtl Material');
      expect(result).toBe('newmtl Material');
    });

    it('should handle line with only comment', () => {
      const result = MTLFile._stripComments('# just a comment');
      expect(result).toBe('');
    });
  });
});
