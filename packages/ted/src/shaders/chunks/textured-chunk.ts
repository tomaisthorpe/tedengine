export default {
  vertex: {
    before: `
      in vec2 aVertexUV;
      in vec2 aVertexInstanceUV;

      uniform float uEnableInstanceUVs;
      uniform vec2 uInstanceUVScale;

      out highp vec2 vUV;
    `,
    main: `
      vUV = (aVertexInstanceUV * uEnableInstanceUVs + aVertexUV * (1.0 - uEnableInstanceUVs)) * uInstanceUVScale;
    `,
  },
  fragment: {
    before: `
      in highp vec2 vUV;

      uniform sampler2D uTexture;
      uniform vec4 uColorFilter;

      out vec4 outputColor;
    `,
    main: `
      vec4 textureColor = texture(uTexture, vec2(vUV.x, 1.0 - vUV.y));
      outputColor = textureColor * uColorFilter;
    `,
  },
};
