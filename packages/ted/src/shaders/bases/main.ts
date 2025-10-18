export const vertexShader = (before: string, main: string, after: string) =>
  `#version 300 es

${before}
in vec4 aVertexPosition;

uniform mat4 uMMatrix;

uniform Global {
  mat4 uVPMatrix;
};

void main() {
  gl_Position = uVPMatrix * uMMatrix * aVertexPosition;
  ${main}
}

${after}
`;

export const fragmentShader = (before: string, main: string, after: string) =>
  `#version 300 es
precision mediump float;

${before}

uniform Lighting {
  vec4 uAmbientLight;
  vec3 uDirectionalLightDir;
  vec4 uDirectionalLight;
};

void main() {
  ${main}
}

${after}
`;

export const mainShader = {
  vertexShader,
  fragmentShader,
};
