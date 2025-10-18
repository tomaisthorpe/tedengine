export const colorChunk = {
  vertex: {
    before: `
        in vec4 aVertexColor;

        out highp vec4 vColor;
    `,
    main: `
      vColor = aVertexColor;
    `,
  },
  fragment: {
    before: `
      in highp vec4 vColor;

      out vec4 outputColor;
    `,
    main: `
      outputColor = vColor;
    `,
  },
};
