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
        vec4 uLightColor = vec4(1.0, 1.0, 1.0, 1.0);
        vec4 normal = normalize(uMMatrix * vec4(vNormal.xyz, 0.0));
        float directionalBrightness = max(0.0, dot(vec3(normal.xyz), uLightDirection));
        vec4 color = vColor;

        // Calculate light intensities
        vec3 ambientIntensity = uAmbientLight.rgb * uAmbientLight.a;
        vec3 directionalIntensity = uLightColor.rgb * directionalBrightness;

        // Calculate total light intensity and normalize if it exceeds 1.0
        vec3 totalIntensity = ambientIntensity + directionalIntensity;
        float maxIntensity = max(max(totalIntensity.r, totalIntensity.g), totalIntensity.b);
        vec3 normalizedIntensity = maxIntensity > 1.0 ? totalIntensity / maxIntensity : totalIntensity;

        // Apply normalized lighting to preserve color relationships
        outputColor = vec4(color.rgb * normalizedIntensity, 1.0);
        `,
  },
};
