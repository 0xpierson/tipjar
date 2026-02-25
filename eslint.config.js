import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(js.configs.recommended, ...tseslint.configs.recommended, {
  languageOptions: {
    globals: {
      window: 'readonly',
      document: 'readonly',
      navigator: 'readonly',
      console: 'readonly',
      fetch: 'readonly',
      setTimeout: 'readonly',
      clearTimeout: 'readonly',
      setInterval: 'readonly',
      clearInterval: 'readonly',
      Promise: 'readonly',
      URL: 'readonly',
      URLSearchParams: 'readonly',
      crypto: 'readonly',
      btoa: 'readonly',
      atob: 'readonly',
    },
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
  },
});
