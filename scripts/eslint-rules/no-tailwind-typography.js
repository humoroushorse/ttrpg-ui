/**
 * ESLint rule to detect Tailwind typography classes
 * Detects: text-*, font-*, leading-*, tracking-*, etc.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow Tailwind typography utility classes in favor of design tokens',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noTailwindTypography: 'Avoid Tailwind typography class "{{className}}". Use design tokens (var(--g-typography-*)) in SCSS instead.',
    },
    schema: [],
  },

  create(context) {
    // Regex patterns for Tailwind typography classes
    const typographyPatterns = [
      // Font size: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, etc.
      /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/,
      // Font weight: font-thin, font-light, font-normal, font-medium, font-semibold, font-bold, font-extrabold, font-black
      /\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/,
      // Font family: font-sans, font-serif, font-mono
      /\bfont-(sans|serif|mono)\b/,
      // Line height: leading-none, leading-tight, leading-snug, leading-normal, leading-relaxed, leading-loose
      /\bleading-(none|tight|snug|normal|relaxed|loose|\d+)\b/,
      // Letter spacing: tracking-tighter, tracking-tight, tracking-normal, tracking-wide, tracking-wider, tracking-widest
      /\btracking-(tighter|tight|normal|wide|wider|widest)\b/,
      // Text decoration: underline, overline, line-through, no-underline
      /\b(underline|overline|line-through|no-underline)\b/,
      // Text transform: uppercase, lowercase, capitalize, normal-case
      /\b(uppercase|lowercase|capitalize|normal-case)\b/,
      // Text alignment: text-left, text-center, text-right, text-justify
      /\btext-(left|center|right|justify|start|end)\b/,
      // Font style: italic, not-italic
      /\b(italic|not-italic)\b/,
    ];

    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          const value = node.value;

          // Check if the string contains Tailwind typography classes
          for (const pattern of typographyPatterns) {
            const matches = value.match(pattern);
            if (matches) {
              context.report({
                node,
                messageId: 'noTailwindTypography',
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

        // Check template literals for Tailwind typography classes
        for (const pattern of typographyPatterns) {
          const matches = value.match(pattern);
          if (matches) {
            context.report({
              node,
              messageId: 'noTailwindTypography',
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
