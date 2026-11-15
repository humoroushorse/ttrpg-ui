// Kiro PreToolUse hook (fs_write): blocks writing a NEW ttrpg-ui project.json by hand, so new
// projects come from the workspace generators. Reads the tool call as JSON on stdin; exit 2 blocks.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}

/** Every string in the tool call that names a project.json */
const paths = [];
const walk = (value) => {
  if (typeof value === 'string') {
    if (/(^|\/)project\.json$/.test(value)) paths.push(value);
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach(walk);
  }
};
walk(input.tool_input ?? input.toolInput ?? input.input ?? input);

const blocked = paths.filter((p) => {
  const abs = resolve(input.cwd ?? process.cwd(), p);
  return abs.includes('/ttrpg-ui/') && !abs.includes('/node_modules/') && !existsSync(abs);
});
if (blocked.length) {
  console.error(
    `Don't hand-write a new project (${blocked.join(', ')}). Use the workspace generators:\n` +
      '  npm exec nx -- g @ttrpg-ui/workspace-plugin:feature <plural> --scope=<scope> --no-interactive\n' +
      '  npm exec nx -- g @ttrpg-ui/workspace-plugin:library <name> --type=<type> --scope=<scope> --no-interactive\n' +
      '(run from ttrpg-ui; add --dry-run to preview). They make project.json, tsconfig, eslint, tags and the path alias.',
  );
  process.exit(2);
}
