// Fails when a project doesn't have exactly one scope: and one type: tag that the import rules
// in the root eslint.config.mjs know about. A project without them isn't covered by those rules.
import { createProjectGraphAsync } from '@nx/devkit';
import { scopeRules, typeRules } from '../../../eslint.config.mjs';

const graph = await createProjectGraphAsync({ exitOnError: true });
const problems = [];

for (const [name, node] of Object.entries(graph.nodes)) {
  const tags = node.data.tags ?? [];
  for (const [prefix, rules] of [
    ['scope:', scopeRules],
    ['type:', typeRules],
  ]) {
    const found = tags.filter((t) => t.startsWith(prefix));
    if (found.length !== 1) {
      problems.push(`${name}: needs exactly one ${prefix} tag, has [${found.join(', ')}]`);
    } else if (!(found[0] in rules)) {
      problems.push(`${name}: ${found[0]} has no rule in eslint.config.mjs (add it to ${prefix.slice(0, -1)}Rules)`);
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`All ${Object.keys(graph.nodes).length} projects have known scope: and type: tags.`);
