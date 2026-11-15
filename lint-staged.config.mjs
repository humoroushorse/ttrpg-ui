// The pre-commit hook (.husky/pre-commit). Nx lints the projects the uncommitted changes touch
// (lint runs stylelint first); a function drops the file paths lint-staged would append, which
// eslint would otherwise read as patterns of its own.
export default {
  '{apps,features,shared,tools}/**/*.{ts,html,scss}': () => 'nx affected -t lint --uncommitted',
  '{apps,features,shared,tools}/**/*.{ts,json,md,html,scss}': 'prettier --write',
};
