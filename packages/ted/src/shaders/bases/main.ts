export const vertexShader = (before: string, main: string, after: string) =>
  `#version 300 es

${before}
in vec4 aVertexPosition;

uniform mat4 uMMatrix;

uniform Global {
  mat4 uVPMatrix;
};

void main() {
  ${main}

  gl_Position = uVPMatrix * uMMatrix * aVertexPosition;
}

${after}
`;

export const fragmentShader = (before: string, main: string, after: string) =>
  `#version 300 es
precision mediump float;

${before}

uniform Lighting {
  float uAmbientLight;
  vec3 uLightDirection;
};

void main() {
  ${main}
}

${after}
`;

export default {
  vertexShader,
  fragmentShader,
};
