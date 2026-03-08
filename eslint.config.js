import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  // Global ignores
  {
    ignores: ['dist/', 'coverage/', 'node_modules/', 'scripts/']
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Vue recommended rules
  ...pluginVue.configs['flat/recommended'],

  // Vue files: use TS parser inside <script> blocks
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser
      }
    }
  },

  // Test files: add Vitest globals
  {
    files: ['**/*.spec.ts', '**/*.spec.js', '**/*.test.ts', '**/*.test.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    }
  },

  // Test setup and Firebase config: add Node globals
  {
    files: ['**/vitest-setup.*', '**/test-utils.*', '**/firebaseConfig.*'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },

  // Project-wide settings
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser
      }
    },
    rules: {
      // Relax rules for incremental migration (JS files still exist)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-useless-assignment': 'warn',

      // Vue layout rules - disabled (better handled by Prettier)
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-indent': 'off',
      'vue/multiline-html-element-content-newline': 'off'
    }
  }
]
