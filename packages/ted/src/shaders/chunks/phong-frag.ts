export default {
  vertex: {
    before: `
        out highp vec4 vLightSpacePosition;
        uniform highp mat4 uDepthMatrix;
    `,
    main: `
        vLightSpacePosition = uDepthMatrix * (uMMatrix * aVertexPosition);
    `,
  },
  fragment: {
    before: `
        in highp vec4 vPosition;
        in highp vec4 vColor;
        in highp vec4 vNormal;
        in highp vec4 vLightSpacePosition;

        uniform highp mat4 uMMatrix;
        uniform sampler2D uDepthTexture;
        uniform float uShadowsEnabled;

        out vec4 outputColor;

        float ShadowCalculation(vec4 fragPosLightSpace) {
            vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
            projCoords = projCoords * 0.5 + 0.5;
            float closestDepth = texture(uDepthTexture, projCoords.xy).r;
            float currentDepth = projCoords.z;
            float bias = 0.0055;
            float shadow = currentDepth - bias > closestDepth ? 1.0 : 0.0;
            return shadow;
        }
        `,
    main: `
        vec4 normal = normalize(uMMatrix * vec4(vNormal.xyz, 0.0));
        float directionalBrightness = max(0.0, dot(vec3(normal.xyz), uDirectionalLightDir)) * uDirectionalLight.a;
        vec4 color = vColor;

        // Calculate light intensities
        vec3 ambientIntensity = uAmbientLight.rgb * uAmbientLight.a;
        vec3 directionalIntensity = uDirectionalLight.rgb * directionalBrightness;

        // If shadows aren't enabled, set the shadow to 0
        float shadow = uShadowsEnabled > 0.0 ? ShadowCalculation(vLightSpacePosition) : 0.0;

        // Calculate total light intensity and normalize if it exceeds 1.0
        vec3 totalIntensity = ambientIntensity + (1.0 - shadow) * directionalIntensity;
        float maxIntensity = max(max(totalIntensity.r, totalIntensity.g), totalIntensity.b);
        vec3 normalizedIntensity = maxIntensity > 1.0 ? totalIntensity / maxIntensity : totalIntensity;


        // Output all components of projected depth coordinates for debugging
        outputColor = vec4(color.rgb * normalizedIntensity, 1.0);
        `,
  },
};
