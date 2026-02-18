import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/**'] },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      eqeqeq: 'error',
      curly: 'error',
      'no-console': 'off',
      'no-unused-vars': 'warn',
      'no-undef': 'error',
    },
  },
];
