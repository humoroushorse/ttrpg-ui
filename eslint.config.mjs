import nx from '@nx/eslint-plugin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// What each project may import, by tag. Every project needs one scope: and one type: tag
// (`nx run workspace-plugin:check-tags`). A project matching several rules must pass all of them.
export const scopeRules = {
  'scope:shared': ['scope:shared'],
  'scope:auth': ['scope:auth', 'scope:user', 'scope:shared'],
  'scope:user': ['scope:user', 'scope:auth', 'scope:shared'],
  'scope:dnd': ['scope:dnd', 'scope:auth', 'scope:user', 'scope:shared'],
  'scope:event-planning': ['scope:event-planning', 'scope:auth', 'scope:user', 'scope:shared'],
  'scope:sprint-management': ['scope:sprint-management', 'scope:auth', 'scope:user', 'scope:shared'],
  'scope:tooling': [],
};
export const typeRules = {
  'type:app': ['type:feature-shell', 'type:ui', 'type:data-access', 'type:models', 'type:util'],
  'type:e2e': ['type:testing', 'type:models', 'type:util'],
  'type:feature-shell': ['type:ui', 'type:data-access', 'type:models', 'type:util'],
  'type:ui': ['type:ui', 'type:models', 'type:util'],
  'type:data-access': ['type:data-access', 'type:models', 'type:util'],
  'type:util': ['type:util', 'type:models'],
  'type:models': ['type:models'],
  'type:testing': ['type:testing', 'type:data-access', 'type:models', 'type:util'],
  'type:tooling': [],
};
// Projects that broke the rules before they existed; they opt in with `legacyBoundaries` in their
// own eslint.config.mjs. Fixes tracked in TODO.md.
const legacyRules = {
  ...scopeRules,
  ...typeRules,
  'scope:shared': [...scopeRules['scope:shared'], 'scope:auth', 'scope:sprint-management'],
  'type:feature-shell': [...typeRules['type:feature-shell'], 'type:feature-shell'],
  'type:ui': [...typeRules['type:ui'], 'type:data-access'],
  'type:util': [...typeRules['type:util'], 'type:data-access'],
};

const boundaries = (rules, extraTags = []) => [
  'error',
  {
    enforceBuildableLibDependency: true,
    allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
    depConstraints: Object.entries(rules).map(([sourceTag, tags]) => ({
      sourceTag,
      onlyDependOnLibsWithTags: sourceTag.startsWith('type:') && tags.length ? [...tags, ...extraTags] : tags,
    })),
  },
];

// sprint-management predates the UI standards (headings, inline templates and styles); it opts out
// in its own eslint.config.mjs files until it's brought up to date
export const legacySprintManagement = {
  files: ['**/*.ts', '**/*.html'],
  rules: { 'ttrpg-custom/heading-class-level': 'off', 'ttrpg-custom/component-inline-limits': 'off' },
};
export const legacyBoundaries = {
  files: ['**/*.ts'],
  rules: { '@nx/enforce-module-boundaries': boundaries(legacyRules) },
};

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
          'component-inline-limits': require('./scripts/eslint-rules/component-inline-limits.js'),
        },
      },
    },
    rules: {
      '@nx/enforce-module-boundaries': boundaries({ ...scopeRules, ...typeRules }),
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
      'ttrpg-custom/component-inline-limits': ['error', { maxTemplateLines: 15 }],
    },
  },
  {
    // templates, inline ones too (angular-eslint extracts them as .html)
    files: ['**/*.html'],
    plugins: {
      'ttrpg-custom': { rules: { 'heading-class-level': require('./scripts/eslint-rules/heading-class-level.js') } },
    },
    rules: { 'ttrpg-custom/heading-class-level': 'error' },
  },
  {
    // specs may also use testing libraries (fixtures, mocks)
    files: ['**/*.spec.ts', '**/test-setup.ts'],
    rules: { '@nx/enforce-module-boundaries': boundaries({ ...scopeRules, ...typeRules }, ['type:testing']) },
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
