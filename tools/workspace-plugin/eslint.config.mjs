import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    // starter files are EJS templates, not source
    ignores: ['src/**/files/**'],
  },
];
