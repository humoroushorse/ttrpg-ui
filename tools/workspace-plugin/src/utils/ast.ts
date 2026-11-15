import type { Tree } from '@nx/devkit';
import * as ts from 'typescript';

// Small text edits located with the TypeScript AST. formatFiles tidies the inserted text afterwards.

export function readSource(tree: Tree, file: string): ts.SourceFile {
  const text = tree.read(file, 'utf-8');
  if (text === null) throw new Error(`${file} doesn't exist`);
  return ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
}

function find<T extends ts.Node>(node: ts.Node, test: (n: ts.Node) => n is T): T | undefined {
  if (test(node)) return node;
  return ts.forEachChild(node, (child) => find(child, test));
}

/** The array a top-level `const <name> = [...]` (or `name: Type[] = [...]`) is set to */
export function arrayOfConst(source: ts.SourceFile, name: string): ts.ArrayLiteralExpression {
  const decl = find(
    source,
    (n): n is ts.VariableDeclaration => ts.isVariableDeclaration(n) && n.name.getText() === name,
  );
  if (!decl?.initializer || !ts.isArrayLiteralExpression(decl.initializer)) {
    throw new Error(`${source.fileName}: no \`const ${name} = [...]\``);
  }
  return decl.initializer;
}

/** The object a top-level `const <name> = {...}` is set to */
export function objectOfConst(source: ts.SourceFile, name: string): ts.ObjectLiteralExpression {
  const decl = find(
    source,
    (n): n is ts.VariableDeclaration => ts.isVariableDeclaration(n) && n.name.getText() === name,
  );
  if (!decl?.initializer || !ts.isObjectLiteralExpression(decl.initializer)) {
    throw new Error(`${source.fileName}: no \`const ${name} = {...}\``);
  }
  return decl.initializer;
}

/** The array a property `<name>: [...]` of an object literal is set to */
export function arrayOfProperty(
  object: ts.ObjectLiteralExpression,
  name: string,
): ts.ArrayLiteralExpression | undefined {
  const prop = object.properties.find((p) => ts.isPropertyAssignment(p) && p.name.getText() === name);
  return prop && ts.isPropertyAssignment(prop) && ts.isArrayLiteralExpression(prop.initializer)
    ? prop.initializer
    : undefined;
}

/** The array a class field `readonly <name> = [...]` is set to */
export function arrayOfField(source: ts.SourceFile, name: string): ts.ArrayLiteralExpression {
  const field = find(
    source,
    (n): n is ts.PropertyDeclaration => ts.isPropertyDeclaration(n) && n.name.getText() === name,
  );
  if (!field?.initializer || !ts.isArrayLiteralExpression(field.initializer)) {
    throw new Error(`${source.fileName}: no class field \`${name} = [...]\``);
  }
  return field.initializer;
}

/**
 * Inserts `element` into an array: first, last, or right after the last element `after` matches.
 * Returns the file's new text.
 */
export function insertIntoArray(
  source: ts.SourceFile,
  array: ts.ArrayLiteralExpression,
  element: string,
  at: 'start' | 'end' | { after: (e: ts.Expression) => boolean },
): string {
  const text = source.getFullText();
  const elements = array.elements;
  let index: number;
  let insert: string;
  if (at === 'start' || elements.length === 0) {
    index = array.getStart() + 1;
    insert = elements.length ? `\n${element},` : `\n${element}\n`;
  } else {
    const matches = at === 'end' ? [] : elements.filter(at.after);
    const prev = matches.length ? matches[matches.length - 1] : elements[elements.length - 1];
    index = prev.getEnd();
    // keep a trailing comma after the previous element, if the array had one
    const hasComma = text.slice(index).trimStart().startsWith(',');
    if (hasComma) index = text.indexOf(',', index) + 1;
    insert = hasComma ? `\n${element},` : `,\n${element}`;
  }
  return text.slice(0, index) + insert + text.slice(index);
}

/** Adds `import { symbol } from 'from'`, or the symbol to an existing import from there */
export function addNamedImport(tree: Tree, file: string, symbol: string, from: string): void {
  const source = readSource(tree, file);
  const text = source.getFullText();
  const imports = source.statements.filter(ts.isImportDeclaration);
  const existing = imports.find(
    (i) => (i.moduleSpecifier as ts.StringLiteral).text === from && !i.importClause?.isTypeOnly,
  );
  const named = existing?.importClause?.namedBindings;
  if (named && ts.isNamedImports(named)) {
    if (named.elements.some((e) => e.name.text === symbol)) return;
    const last = named.elements[named.elements.length - 1];
    const at = last ? last.getEnd() : named.getStart() + 1;
    tree.write(file, text.slice(0, at) + `${last ? ', ' : ' '}${symbol}` + text.slice(at));
    return;
  }
  const line = `import { ${symbol} } from '${from}';\n`;
  const at = imports.length ? imports[imports.length - 1].getEnd() + 1 : 0;
  tree.write(file, text.slice(0, at) + line + text.slice(at));
}

/** A string literal's text, or undefined */
export function stringValue(node: ts.Node | undefined): string | undefined {
  return node && ts.isStringLiteralLike(node) ? node.text : undefined;
}

/** The value of property `name` in an object literal */
export function property(node: ts.Node, name: string): ts.Expression | undefined {
  if (!ts.isObjectLiteralExpression(node)) return undefined;
  const prop = node.properties.find((p) => ts.isPropertyAssignment(p) && p.name.getText() === name);
  return prop && ts.isPropertyAssignment(prop) ? prop.initializer : undefined;
}
