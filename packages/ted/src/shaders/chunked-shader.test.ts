import { generateShader } from './chunked-shader';
import type { TBaseShader, TShaderChunk } from './chunked-shader';

describe('generateShader', () => {
  const mockBaseShader: TBaseShader = {
    vertexShader: (before, main, after) => `
      // Vertex Shader
      ${before}
      void main() {
        ${main}
      }
      ${after}
    `,
    fragmentShader: (before, main, after) => `
      // Fragment Shader
      ${before}
      void main() {
        ${main}
      }
      ${after}
    `,
  };

  it('should generate shaders with no chunks', () => {
    const result = generateShader(mockBaseShader, []);

    expect(result.vertexShader).toContain('void main()');
    expect(result.vertexShader).not.toContain('// Custom code');
    expect(result.fragmentShader).toContain('void main()');
    expect(result.fragmentShader).not.toContain('// Custom code');
  });

  it('should generate shaders with single chunk', () => {
    const chunk: TShaderChunk = {
      vertex: {
        before: '// Vertex before',
        main: '// Vertex main',
        after: '// Vertex after',
      },
      fragment: {
        before: '// Fragment before',
        main: '// Fragment main',
        after: '// Fragment after',
      },
    };

    const result = generateShader(mockBaseShader, [chunk]);

    expect(result.vertexShader).toContain('// Vertex before');
    expect(result.vertexShader).toContain('// Vertex main');
    expect(result.vertexShader).toContain('// Vertex after');
    expect(result.fragmentShader).toContain('// Fragment before');
    expect(result.fragmentShader).toContain('// Fragment main');
    expect(result.fragmentShader).toContain('// Fragment after');
  });

  it('should generate shaders with multiple chunks', () => {
    const chunks: TShaderChunk[] = [
      {
        vertex: {
          before: '// Vertex before 1',
          main: '// Vertex main 1',
        },
        fragment: {
          before: '// Fragment before 1',
          main: '// Fragment main 1',
        },
      },
      {
        vertex: {
          before: '// Vertex before 2',
          main: '// Vertex main 2',
          after: '// Vertex after 2',
        },
        fragment: {
          before: '// Fragment before 2',
          main: '// Fragment main 2',
          after: '// Fragment after 2',
        },
      },
    ];

    const result = generateShader(mockBaseShader, chunks);

    // Check vertex shader
    expect(result.vertexShader).toContain('// Vertex before 1');
    expect(result.vertexShader).toContain('// Vertex before 2');
    expect(result.vertexShader).toContain('// Vertex main 1');
    expect(result.vertexShader).toContain('// Vertex main 2');
    expect(result.vertexShader).toContain('// Vertex after 2');

    // Check fragment shader
    expect(result.fragmentShader).toContain('// Fragment before 1');
    expect(result.fragmentShader).toContain('// Fragment before 2');
    expect(result.fragmentShader).toContain('// Fragment main 1');
    expect(result.fragmentShader).toContain('// Fragment main 2');
    expect(result.fragmentShader).toContain('// Fragment after 2');
  });

  it('should handle chunks with missing sections', () => {
    const chunks: TShaderChunk[] = [
      {
        vertex: {
          main: '// Only vertex main',
        },
        fragment: {
          before: '// Only fragment before',
        },
      },
    ];

    const result = generateShader(mockBaseShader, chunks);

    expect(result.vertexShader).toContain('// Only vertex main');
    expect(result.vertexShader).not.toContain('undefined');
    expect(result.fragmentShader).toContain('// Only fragment before');
    expect(result.fragmentShader).not.toContain('undefined');
  });

  it('should maintain correct shader structure', () => {
    const chunk: TShaderChunk = {
      vertex: {
        before: 'attribute vec3 position;',
        main: 'gl_Position = vec4(position, 1.0);',
      },
      fragment: {
        before: 'uniform vec4 color;',
        main: 'gl_FragColor = color;',
      },
    };

    const result = generateShader(mockBaseShader, [chunk]);

    // Check vertex shader structure
    expect(result.vertexShader).toMatch(
      /\/\/ Vertex Shader[\s\S]*attribute vec3 position;[\s\S]*void main\(\)[\s\S]*gl_Position = vec4\(position, 1\.0\);[\s\S]*}/,
    );

    // Check fragment shader structure
    expect(result.fragmentShader).toMatch(
      /\/\/ Fragment Shader[\s\S]*uniform vec4 color;[\s\S]*void main\(\)[\s\S]*gl_FragColor = color;[\s\S]*}/,
    );
  });
});
