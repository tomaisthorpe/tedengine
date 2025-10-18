export const paletteVertChunk = {
  vertex: {
    before: `
        in vec4 aVertexNormal;
        in float aVertexColor;

        out highp vec4 vColor;
        out highp vec4 vNormal;
        out highp vec4 vPosition;

        uniform sampler2D uPalette;
        uniform float uPaletteSize;
    `,
    main: `
        float offset = 1.0 / uPaletteSize / 2.0;
        vColor = texture(uPalette, vec2((aVertexColor / uPaletteSize) + offset, 0));

        vNormal = aVertexNormal;
        vPosition = aVertexPosition;
        `,
  },
};
