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
        vec4 lightPosition = vec4(50, 0, 0, 0);

        mat4 normalMatrix = transpose(inverse(uMMatrix));
        vec4 normal = normalize(normalMatrix * vNormal);
        vec4 fragPosition = vec4(uMMatrix * vPosition);
        vec4 surfaceToLight = (lightPosition - fragPosition);
        vec4 color = vColor;

        float brightness = dot(normal, surfaceToLight) / (length(surfaceToLight) * length(normal)) * 0.6 + 0.4;
        outputColor = vec4(color.rgb * brightness, 1.0);
        `,
  },
};
