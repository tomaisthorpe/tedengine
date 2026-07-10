import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import baseConfig from '../../eslint.config.mjs';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: ['**/dist'],
  },
  ...baseConfig,
  ...compat.extends('plugin:react/recommended'),
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Override or add rules here
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.test.js',
      '**/*.test.jsx',
      '**/test/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
