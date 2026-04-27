/**
 * ESLint rule to detect requirement reference comments
 * Detects: "Requirement X.Y", "Req X.Y", "REQ-X.Y", etc.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow requirement reference comments in code',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noRequirementComment:
        'Remove requirement reference comment "{{comment}}". Code should be self-documenting without requirement IDs.',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    // Regex patterns for requirement references
    const requirementPatterns = [/\b(Requirement|Req|REQ)[\s-]?\d+\.\d+\b/i, /\b(Requirement|Req|REQ)[\s-]?\d+\b/i];

    return {
      Program() {
        const comments = sourceCode.getAllComments();

        comments.forEach((comment) => {
          const commentText = comment.value;

          for (const pattern of requirementPatterns) {
            const matches = commentText.match(pattern);
            if (matches) {
              context.report({
                node: comment,
                messageId: 'noRequirementComment',
                data: {
                  comment: matches[0],
                },
              });
            }
          }
        });
      },
    };
  },
};
