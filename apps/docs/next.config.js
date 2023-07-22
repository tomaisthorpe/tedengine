//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const { getConfigFileParsingDiagnostics } = require('typescript');

const nextra = require('nextra');

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.jsx',
});

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  webpack: (config, options) => {
    const assetTest = /(.*)assets(.*)\.(obj|mtl|program|png|wav|ldtk)$/;
    config.module.rules.push({
      test: assetTest,
      type: 'asset/resource',
      generator: {
        filename: 'static/[hash][ext][query]',
      },
    });
    config.module.rules.push({
      test: /(.*)shaders(.*)\.(obj|mtl|program|png|wav|ldtk)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/[hash][ext][query]',
        // filename: 'assets/[name][ext][query]',
      },
    });

    // Ensure the default loader doesn't break assets
    const rule = config.module.rules.find(
      (/** @type {{ loader: string; }} */ item) =>
        item.loader === 'next-image-loader'
    );
    rule.exclude = assetTest;

    config.resolve.fallback = {
      path: false,
      fs: false,
    };

    return config;
  },
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
  withNextra,
];

module.exports = composePlugins(...plugins)(nextConfig);
