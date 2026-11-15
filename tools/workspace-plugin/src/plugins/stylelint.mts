import { dirname } from 'node:path';
import type { CreateNodes } from '@nx/devkit';

/**
 * Adds a `stylelint` target to every project: the root .stylelintrc on the project's .scss files.
 * `lint` depends on it (nx.json targetDefaults), so `nx run-many -t lint` runs both. Files in
 * .stylelintignore (sprint-management) are skipped.
 */
export const createNodes: CreateNodes = [
  '**/project.json',
  (files) =>
    files.map((file) => {
      const root = dirname(file);
      return [
        file,
        {
          projects: {
            [root]: {
              targets: {
                stylelint: {
                  command: `stylelint "${root}/**/*.scss" --allow-empty-input`,
                  options: { cwd: '{workspaceRoot}' },
                  cache: true,
                  inputs: [
                    '{projectRoot}/**/*.scss',
                    '{workspaceRoot}/.stylelintrc',
                    '{workspaceRoot}/.stylelintignore',
                    '{workspaceRoot}/shared/scss/**/*.scss',
                  ],
                },
              },
            },
          },
        },
      ] as const;
    }),
];
