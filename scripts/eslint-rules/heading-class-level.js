/**
 * A heading styled with a g-text-* class uses its own level's: <h2 class="g-text-h2">, never
 * <h2 class="g-text-h3">. For another look, pick the heading level that matches it; levels may be
 * skipped. Runs on templates; angular-eslint extracts inline ones as .html.
 */
const HEADING = /<h([1-6])\b[^>]*?\bclass="([^"]*)"/g;

module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Require a heading to use the g-text-h* class of its own level' },
    messages: {
      mismatch:
        '<h{{level}}> with "{{found}}": use g-text-h{{level}}, or the heading level that matches the look (levels may be skipped).',
    },
    schema: [],
  },
  create(context) {
    const source = context.sourceCode;
    return {
      Program(node) {
        for (const m of source.text.matchAll(HEADING)) {
          const level = m[1];
          const found = m[2].split(/\s+/).filter((c) => c.startsWith('g-text-'));
          if (!found.length || (found.length === 1 && found[0] === `g-text-h${level}`)) continue;
          context.report({
            node,
            loc: source.getLocFromIndex(m.index),
            messageId: 'mismatch',
            data: { level, found: found.join(' ') },
          });
        }
      },
    };
  },
};
