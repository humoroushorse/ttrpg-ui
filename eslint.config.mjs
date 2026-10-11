import nx from '@nx/eslint-plugin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    'ignores': ['**/dist', '**/vite.config.*.timestamp*', '**/vitest.config.*.timestamp*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      'ttrpg-custom': {
        rules: {
          'no-tailwind-colors': require('./scripts/eslint-rules/no-tailwind-colors.js'),
          'no-tailwind-typography': require('./scripts/eslint-rules/no-tailwind-typography.js'),
          'no-requirement-comments': require('./scripts/eslint-rules/no-requirement-comments.js'),
          'no-tailwind-in-templates': require('./scripts/eslint-rules/no-tailwind-in-templates.js'),
        },
      },
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          // allow unused variables starting with "_"
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
          'caughtErrorsIgnorePattern': '^_',
        },
      ],
      // Custom design token enforcement rules (set to warn for baseline)
      'ttrpg-custom/no-tailwind-colors': 'warn',
      'ttrpg-custom/no-tailwind-typography': 'warn',
      'ttrpg-custom/no-requirement-comments': 'warn',
      'ttrpg-custom/no-tailwind-in-templates': 'warn',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts', '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/tailwind.config.js'],
    rules: {
      // Tailwind config files can import shared theme config from outside their project
      '@nx/enforce-module-boundaries': 'off',
    },
  },
  {
    'ignores': ['**/vite.config.*.timestamp*', '**/vitest.config.*.timestamp*'],
  },
];
