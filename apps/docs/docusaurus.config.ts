import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import path from 'path';

function configureEngine(context, options) {
  return {
    name: 'configure-engine-plugin',
    configureWebpack(config, isServer, utils) {
      const rules = config.module.rules;

      const assetTest = /(.*)assets(.*)\.(obj|mtl|program|png|wav|ldtk)$/;

      // Exclude assets from rules that look for png or wav
      rules.forEach((rule) => {
        if (
          rule.test &&
          (rule.test.toString().includes('png') ||
            rule.test.toString().includes('wav'))
        ) {
          rule.exclude = assetTest;
        }
      });

      rules.push({
        test: assetTest,
        type: 'asset/resource',
        generator: {
          filename: 'static/[hash][ext][query]',
        },
      });
      rules.push({
        test: /(.*)shaders(.*)\.(obj|mtl|program|png|wav|ldtk)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/[hash][ext][query]',
        },
      });

      return {
        mergeStrategy: {
          'module.rules': 'replace',
        },
        resolve: {
          alias: {
            '@tedengine/ted': path.resolve(
              __dirname,
              '../../packages/ted/src/index.ts',
            ),
            '@examples': path.resolve(__dirname, './src/examples/'),
            '@assets': path.resolve(__dirname, './assets/'),
          },
        },
        module: {
          rules,
        },
      };
    },
  };
}

const config: Config = {
  title: 'TED Engine',
  tagline: 'An unfinished WebGL and TypeScript based game engine. ',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://ted.tomaisthorpe.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    configureEngine as any,
    [
      'docusaurus-plugin-typedoc-api',
      {
        projectRoot: path.join(__dirname, '../..'),
        packages: ['packages/ted'],
        tsconfigName: 'packages/ted/tsconfig.json',
      },
    ],
  ],
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/tomaisthorpe/tedengine/tree/main/apps/docs/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'TED',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: 'api',
          label: 'API',
          position: 'left',
        },
        {
          href: 'https://github.com/tomaisthorpe/tedengine',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Examples',
              to: '/examples/2d/sprite-canvas',
            },
            {
              to: 'api',
              label: 'API',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/tomaisthorpe/tedengine',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} TED Engine. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
