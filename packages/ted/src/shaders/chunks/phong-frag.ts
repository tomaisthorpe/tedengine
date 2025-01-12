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
        float light = dot(vec3(normal.xyz), normalize(-vec3(uLightDirection.xyz)));
        vec4 color = vColor;

        float brightness = light * (0.7 - uAmbientLight) + uAmbientLight;
        outputColor = vec4(color.rgb * brightness, 1.0);
        `,
  },
};
