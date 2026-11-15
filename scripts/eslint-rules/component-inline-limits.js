/**
 * A component's template goes in its own .html once it's longer than a few lines, and its styles
 * always go in a .scss (stylelint only reads .scss files, so inline styles would skip its rules).
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Limit inline component templates and forbid inline styles' },
    messages: {
      longTemplate: 'Inline template is {{lines}} lines (at most {{max}}): move it to templateUrl.',
      inlineStyles: 'Inline styles skip stylelint: move them to styleUrl (a .scss file).',
    },
    schema: [{ type: 'object', properties: { maxTemplateLines: { type: 'integer' } }, additionalProperties: false }],
  },
  create(context) {
    const max = context.options[0]?.maxTemplateLines ?? 15;
    const isComponent = (call) =>
      call?.type === 'CallExpression' && call.callee.type === 'Identifier' && call.callee.name === 'Component';
    return {
      'CallExpression > ObjectExpression > Property'(prop) {
        if (!isComponent(prop.parent.parent) || prop.key.type !== 'Identifier') return;
        if (prop.key.name === 'styles') {
          context.report({ node: prop, messageId: 'inlineStyles' });
        } else if (prop.key.name === 'template') {
          const text = context.sourceCode.getText(prop.value).trim();
          const lines = text.split('\n').filter((line) => line.trim() && line.trim() !== '`').length;
          if (lines > max) context.report({ node: prop, messageId: 'longTemplate', data: { lines, max } });
        }
      },
    };
  },
};
