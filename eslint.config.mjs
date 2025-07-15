import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import jsLint from '@eslint/js';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginSecurity from 'eslint-plugin-security';
import tsLint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
  recommendedConfig: jsLint.configs.recommended,
  allConfig: jsLint.configs.all,
});

const tsConfig = tsLint.config(
  jsLint.configs.recommended,
  ...tsLint.configs.recommended,
  ...tsLint.configs.strict,
  ...tsLint.configs.stylistic,
);

const eslintConfig = [
  ...compat.extends('prettier'),
  ...tsConfig,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      security: eslintPluginSecurity,
      prettier: eslintPluginPrettier,
    },
  },
  {
    files: ['**/*.{js,mjs,ts}'],
    rules: {
      'linebreak-style': ['error', 'unix'],
      'no-console': 'off',
      'no-unused-vars': 'off',
      'no-duplicate-imports': 'error',
      'no-empty-function': 'warn',
      'no-empty-pattern': 'warn',
      'no-plusplus': [
        'warn',
        {
          allowForLoopAfterthoughts: true,
        },
      ],
      quotes: [
        'error',
        'single',
        { avoidEscape: true, allowTemplateLiterals: true },
      ],
      '@typescript-eslint/no-unused-vars': ['off', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-object-type': [
        1,
        {
          allowInterfaces: 'with-single-extends',
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
    },
  },
  {
    ignores: [
      'node_modules',
      '.history',
      'dist',
      'package',
      'coverage',
      'examples',
      'tests',
    ],
  },
];

export default eslintConfig;
