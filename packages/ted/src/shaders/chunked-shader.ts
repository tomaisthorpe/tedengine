export interface TBaseShader {
  vertexShader: (before: string, main: string, after: string) => string;
  fragmentShader: (before: string, main: string, after: string) => string;
}

export interface TShaderChunk {
  vertex?: {
    before?: string;
    main?: string;
    after?: string;
  };
  fragment?: {
    before?: string;
    main?: string;
    after?: string;
  };
}

export interface TShader {
  vertexShader: string;
  fragmentShader: string;
}

export const generateShader = (b: TBaseShader, c: TShaderChunk[]): TShader => {
  return {
    vertexShader: b.vertexShader(
      c.map((chunk) => chunk.vertex?.before).join('\n'),
      c.map((chunk) => chunk.vertex?.main).join('\n'),
      c.map((chunk) => chunk.vertex?.after).join('\n'),
    ),
    fragmentShader: b.fragmentShader(
      c.map((chunk) => chunk.fragment?.before).join('\n'),
      c.map((chunk) => chunk.fragment?.main).join('\n'),
      c.map((chunk) => chunk.fragment?.after).join('\n'),
    ),
  };
};
