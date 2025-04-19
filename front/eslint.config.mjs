import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// 설정 파일 먼저 제외 설정
const eslintConfig = [
  {
    ignores: [
      'eslint.config.mjs',
      '.eslintrc.js',
      '*.config.js',
      '*.config.mjs',
      'front/extension/*',
      'front/extension/**/*',
    ],
  },

  // 기본 JS 설정
  js.configs.recommended,

  // 기존 설정 확장 - 플러그인 직접 가져오기 대신 extends 사용
  ...compat.config({
    extends: ['next/core-web-vitals', 'airbnb-base', 'prettier'],

    // 모든 규칙들을 여기로 이동
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/require-default-props': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'import/prefer-default-export': 'off',
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'function-declaration',
          unnamedComponents: 'arrow-function',
        },
      ],
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
    },

    // 설정도 여기로 통합
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  }),
];

export default eslintConfig;
