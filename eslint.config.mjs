import js from '@eslint/js';
import nextPlugin from 'eslint-plugin-next';
import { nextConfig } from 'eslint-config-next';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  nextConfig,
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
      next: nextPlugin
    },
    rules: {
      'prettier/prettier': 'error',
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
    },
    ignores: [
      'node_modules/',
      '.next/',
      'dist/',
      '.vercel/',
    ],
  },
];
