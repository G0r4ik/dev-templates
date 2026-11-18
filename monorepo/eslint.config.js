import js from '@eslint/js'
import globals from 'globals'
import pluginNode from 'eslint-plugin-n'
import pluginVue from 'eslint-plugin-vue'
import sonarjs from 'eslint-plugin-sonarjs'
import pluginTurbo from 'eslint-plugin-turbo'
import importPlugin from 'eslint-plugin-import'
import storybook from 'eslint-plugin-storybook'
import pluginPromise from 'eslint-plugin-promise'
import pluginUnicorn from 'eslint-plugin-unicorn'
import pluginSecurity from 'eslint-plugin-security'
import configPrettier from 'eslint-config-prettier/flat'
import pluginComment from 'eslint-plugin-eslint-comments'
import pluginPrettier from 'eslint-plugin-prettier/recommended'

// plugin-jest | vue-eslint-parser | plugin-no-secrets  при необходимости

export default [
  { ignores: ['**/node_modules/**', '**/dist/**'] },
  js.configs.recommended,
  pluginTurbo.configs['flat/recommended'],
  pluginSecurity.configs.recommended,
  pluginPromise.configs['flat/recommended'],
  pluginUnicorn.configs.recommended,
  sonarjs.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    plugins: {
      import: importPlugin,
      'eslint-comments': pluginComment,
      n: pluginNode,
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', 'vue'],
        },
        alias: { map: [['@', './apps/frontend/src']] },
      },
    },
    rules: {
      ...importPlugin.configs.recommended.rules,
      ...pluginComment.configs.recommended.rules,
      'unicorn/no-null': 'off',
      'sonarjs/fixme-tag': 'warn',
      'unicorn/prevent-abbreviation': 'off',
      'turbo/no-undeclared-env-vars': 'off',
      'security/detect-object-injection': 'off', // fix
      'import/no-unresolved': 'off', // fix
      'unicorn/prevent-abbreviations': ['error', { allowList: { i: true } }],
    },
  },
  {
    files: ['apps/frontend/**/*.{js,vue}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2026, process: true },
    },
    rules: {
      'unicorn/filename-case': [
        'error',
        { cases: { camelCase: true, pascalCase: true } },
      ],
    },
  },
  {
    files: ['apps/backend/**/*.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      ...pluginNode.configs['flat/recommended-script'].rules,
      'unicorn/filename-case': ['error', { case: 'camelCase' }],
      'unicorn/prevent-abbreviations': [
        'error',
        { allowList: { req: true, res: true, i: true, e: true } },
      ],
    },
  },
  {
    files: ['**/*.test.js'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      'n/no-unpublished-import': 'off',
    },
  },
  configPrettier,
  pluginPrettier,
  ...storybook.configs['flat/recommended'],
]
