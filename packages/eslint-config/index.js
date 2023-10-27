module.exports = {
  globals: {
    __ENV: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:unicorn/recommended',
    'plugin:n/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['dist', 'test-dist', 'coverage'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    react: {
      version: 'detect',
    },
  },
  root: true,
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      },
    ],
    'n/no-extraneous-import': 'off',
    'n/no-missing-import': 'off',
    'unicorn/prefer-at': 'off',
    'unicorn/prefer-query-selector': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'unicorn/prevent-abbreviations': [
      'error',
      {
        allowList: {
          Props: true,
          i: true,
        },
      },
    ],
    'import/default': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': [
      'error',
      'always',
      {
        ignorePackages: true,
      },
    ],
    'import/namespace': 'off',
    'import/named': 'off',
  },
  overrides: [
    {
      files: '*.tsx',
      rules: {
        'unicorn/no-useless-undefined': 'off',
        'unicorn/filename-case': [
          'error',
          {
            case: 'pascalCase',
          },
        ],
      },
    },
    {
      files: ['vite-env.d.ts'],
      rules: {
        'unicorn/prevent-abbreviations': 'off',
      },
    },
  ],
};
