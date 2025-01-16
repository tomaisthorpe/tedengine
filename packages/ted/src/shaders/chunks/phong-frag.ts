export default {
  fragment: {
    before: `
        in highp vec4 vPosition;
        in highp vec4 vColor;
        in highp vec4 vNormal;

        uniform highp mat4 uMMatrix;

        out vec4 outputColor;
        `,
    main: `
        vec4 normal = normalize(uMMatrix * vec4(vNormal.xyz, 0.0));
        float light = dot(vec3(normal.xyz), uLightDirection);
        vec4 color = vColor;

        float brightness = min(1.0, max(0.0, light) + uAmbientLight);
        outputColor = vec4(color.rgb * brightness, 1.0);
        `,
  },
};
