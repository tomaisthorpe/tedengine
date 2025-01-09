export interface TBaseShader {
  vertexShader: (before: string, main: string, after: string) => string;
  fragmentShader: (before: string, main: string, after: string) => string;
}

export interface TShaderChunk {
  before: string;
  main: string;
  after: string;
}

export interface TShader {
  vertexShader: string;
  fragmentShader: string;
}

export const generateShader = (b: TBaseShader, c: TShaderChunk[]): TShader => {
  return {
    vertexShader: b.vertexShader(
      c.map((chunk) => chunk.before).join('\n'),
      c.map((chunk) => chunk.main).join('\n'),
      c.map((chunk) => chunk.after).join('\n'),
    ),
    fragmentShader: b.fragmentShader(
      c.map((chunk) => chunk.before).join('\n'),
      c.map((chunk) => chunk.main).join('\n'),
      c.map((chunk) => chunk.after).join('\n'),
    ),
  };
};
