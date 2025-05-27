/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';
import { joinPathFragments } from '@nx/devkit';
import { codecovVitePlugin } from '@codecov/vite-plugin';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname);
const workspaceRoot = path.resolve(__dirname, '../..');

export default defineConfig({
  plugins: [
    dts({
      entryRoot: 'src',
      tsconfigPath: joinPathFragments(__dirname, 'tsconfig.lib.json'),
    }),
    react(),
    viteTsConfigPaths({
      root: workspaceRoot,
    }),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: '@tedengine/ted',
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],

  assetsInclude: ['**/*.obj', '**/*.mtl', '**/*.program', '**/*.ldtk'],

  // Uncomment this if you are using workers.
  worker: {
    format: 'es',
    plugins: () => [
      viteTsConfigPaths({
        root: workspaceRoot,
      }),
    ],
  },

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    assetsDir: 'workers',
    outDir: joinPathFragments(workspaceRoot, 'dist/packages/ted'),
    reportCompressedSize: true,
    commonjsOptions: { transformMixedEsModules: true },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: joinPathFragments(projectRoot, 'src/index.ts'),
      name: 'ted',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forgot to update your package.json as well.
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});
