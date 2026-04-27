/**
 * ESLint rule to detect Tailwind color classes
 * Detects: text-*, bg-*, border-*, ring-*, divide-*, placeholder-*, from-*, via-*, to-*
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow Tailwind color utility classes in favor of design tokens',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noTailwindColor: 'Avoid Tailwind color class "{{className}}". Use design tokens (var(--g-color-*)) in SCSS instead.',
    },
    schema: [],
  },

  create(context) {
    // Regex patterns for Tailwind color classes
    const colorPatterns = [
      /\b(text|bg|border|ring|divide|placeholder|from|via|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent|current|inherit)(-\d+)?\b/,
      /\b(text|bg|border|ring|divide|placeholder|from|via|to)-(opacity-\d+)\b/,
    ];

    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          const value = node.value;

          // Check if the string contains Tailwind color classes
          for (const pattern of colorPatterns) {
            const matches = value.match(pattern);
            if (matches) {
              context.report({
                node,
                messageId: 'noTailwindColor',
                data: {
                  className: matches[0],
                },
              });
            }
          }
        }
      },

      TemplateElement(node) {
        const value = node.value.raw;

        // Check template literals for Tailwind color classes
        for (const pattern of colorPatterns) {
          const matches = value.match(pattern);
          if (matches) {
            context.report({
              node,
              messageId: 'noTailwindColor',
              data: {
                className: matches[0],
              },
            });
          }
        }
      },
    };
  },
};
