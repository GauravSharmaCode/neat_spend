const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        console: 'readonly',
        process: 'readonly',
        module: 'writable',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly'
      },
      ecmaVersion: 2022,
      sourceType: 'commonjs'
    },
    rules: {
      'no-console': 'off', // Logger utility needs console
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'prefer-const': 'error',
      'no-var': 'error'
    }
  }
];
