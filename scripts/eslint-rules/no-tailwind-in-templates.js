/**
 * ESLint rule to detect Tailwind classes in Angular HTML templates
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow Tailwind utility classes in Angular templates',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noTailwindInTemplate:
        'Avoid Tailwind class "{{className}}" in template. Use design tokens in component SCSS instead.',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    // Regex patterns for Tailwind classes
    const tailwindPatterns = [
      // Colors
      /\b(text|bg|border|ring|divide|placeholder|from|via|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(-\d+)?\b/g,
      // Typography
      /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/g,
      /\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/g,
      /\bleading-(none|tight|snug|normal|relaxed|loose|\d+)\b/g,
      /\btracking-(tighter|tight|normal|wide|wider|widest)\b/g,
    ];

    return {
      // For inline templates in components
      Literal(node) {
        if (typeof node.value === 'string' && node.value.includes('class=')) {
          checkForTailwind(node, node.value);
        }
      },

      TemplateElement(node) {
        if (node.value.raw.includes('class=')) {
          checkForTailwind(node, node.value.raw);
        }
      },
    };

    function checkForTailwind(node, text) {
      for (const pattern of tailwindPatterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          context.report({
            node,
            messageId: 'noTailwindInTemplate',
            data: {
              className: match[0],
            },
          });
        }
      }
    }
  },
};
