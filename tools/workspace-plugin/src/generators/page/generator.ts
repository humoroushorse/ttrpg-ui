import { formatFiles, generateFiles, getProjects, joinPathFragments, logger, names, Tree } from '@nx/devkit';
import * as path from 'path';
import * as ts from 'typescript';
import { libraryNames, siblingOf } from '../library/names';
import {
  addNamedImport,
  arrayOfConst,
  arrayOfProperty,
  insertIntoArray,
  property,
  readSource,
  stringValue,
} from '../../utils/ast';
import type { PageGeneratorSchema, PageType } from './schema';

export const PAGE_TYPES: PageType[] = ['view-all', 'view', 'create', 'edit', 'blank'];

/** Pages built on the feature's store and route resources */
const API_PAGES: PageType[] = ['view-all', 'view', 'create', 'edit'];

/** The route path by page type; a catalog entity's URL key is its source's slug and its own */
const defaultPath = (type: PageType, catalog: boolean): string | undefined => {
  const key = catalog ? ':source/:slug' : ':id';
  return { 'view-all': '', view: key, create: 'create', edit: `${key}/edit`, blank: undefined }[type];
};

/** sprint-items -> Sprint Items */
export const titleCase = (kebab: string): string =>
  kebab
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/** features/dnd/classes/feature-shell/src/lib/pages */
export const pagesDirectory = (featureShellDirectory: string): string =>
  joinPathFragments(featureShellDirectory, 'src/lib/pages');

/**
 * A page in a feature's feature-shell library, plus its route in lib.routes.ts. Static paths go
 * first in `children` so `create` isn't read as an `:id`.
 */
export async function pageGenerator(tree: Tree, options: PageGeneratorSchema) {
  const type = options.type;
  if (!PAGE_TYPES.includes(type)) {
    throw new Error(`--type must be one of ${PAGE_TYPES.join(', ')} (got ${type})`);
  }
  const lib = libraryNames({
    name: options.name,
    scope: options.scope,
    type: 'feature-shell',
    singular: options.singular,
    catalog: options.catalog,
  });
  const projects = getProjects(tree);
  if (!projects.has(lib.projectName)) {
    throw new Error(
      `No ${lib.projectName}: generate the feature first ` +
        `(nx g @ttrpg-ui/workspace-plugin:feature ${lib.name} --scope=${lib.scope}).`,
    );
  }
  const routesFile = joinPathFragments(lib.directory, 'src/lib/lib.routes.ts');
  if (!tree.exists(routesFile)) {
    throw new Error(`${routesFile} doesn't exist; pages go in a feature-shell made by this plugin.`);
  }
  const dataAccess = siblingOf(lib, 'data-access');
  const storeFile = joinPathFragments(dataAccess.directory, 'src/lib/+state', `${lib.name}.store.ts`);
  if (API_PAGES.includes(type) && !tree.exists(storeFile)) {
    throw new Error(
      `A ${type} page uses the feature's store (${storeFile}): generate data-access with the API pieces first.`,
    );
  }
  // what the store can do decides the buttons; a read-only store has no writes
  const store = tree.read(storeFile, 'utf-8') ?? '';
  const storeHas = (method: string) => store.includes(`${method}: rxMethod`);
  const needs = { create: 'create', edit: 'update' }[type as 'create' | 'edit'];
  if (needs && !storeHas(needs)) {
    throw new Error(
      `A ${type} page saves with the store's ${needs}, and ${storeFile} has none (generated --readOnly?).`,
    );
  }

  const pageName = type === 'blank' ? names(options.page ?? '').fileName : type;
  if (!pageName) {
    throw new Error('--page is required for a blank page: its name, e.g. builder');
  }
  const pagesDir = pagesDirectory(lib.directory);
  const folderOf = (page: string) => `page-${lib.scope}-${lib.name}-${page}`;
  const pageFolder = folderOf(pageName);
  if (tree.exists(joinPathFragments(pagesDir, pageFolder))) {
    throw new Error(`${joinPathFragments(pagesDir, pageFolder)} already exists`);
  }
  const pageClass = `Page${lib.vars.Scope}${lib.vars.Plural}${names(pageName).className}Component`;

  generateFiles(tree, path.join(__dirname, 'files', type), pagesDir, {
    ...lib.vars,
    dataAccessImport: dataAccess.importPath,
    pageFolder,
    pageClass,
    pageSelector: `lib-${pageFolder}`,
    PluralTitle: titleCase(lib.name),
    SingularTitle: titleCase(lib.singular),
    pluralWords: lib.name.replaceAll('-', ' '),
    singularWords: lib.singular.replaceAll('-', ' '),
    // "Classes | TTRPG" could be anything; catalog titles and descriptions say D&D, like spells'
    ListTitle: `${lib.catalog ? 'D&D ' : ''}${titleCase(lib.name)}`,
    listWords: `${lib.catalog ? 'D&D ' : ''}${lib.name.replaceAll('-', ' ')}`,
    itemWords: `${lib.catalog ? 'D&D ' : ''}${lib.singular.replaceAll('-', ' ')}`,
    PageTitle: titleCase(pageName),
    // links to pages that exist now; the feature generator makes create and edit first
    hasCreate: tree.exists(joinPathFragments(pagesDir, folderOf('create'))),
    hasEdit: tree.exists(joinPathFragments(pagesDir, folderOf('edit'))),
    hasDelete: storeHas('delete'),
  });

  const routePath = options.path ?? defaultPath(type, lib.catalog) ?? pageName;
  const login = type === 'create' || type === 'edit';
  const resources = type === 'view' || type === 'edit';
  const route = [
    `path: '${routePath}'`,
    `component: ${pageClass}`,
    login && 'canActivate: [AuthGuards.authGuard]',
    resources && `resources: ${lib.vars.resourcesConst}`,
  ].filter(Boolean);

  const source = readSource(tree, routesFile);
  const shell = arrayOfConst(source, lib.vars.routesConst as string).elements[0];
  const children = shell && ts.isObjectLiteralExpression(shell) ? arrayOfProperty(shell, 'children') : undefined;
  if (!children) {
    throw new Error(`${routesFile}: expected the first route (the shell) to have a children array`);
  }
  if (children.elements.some((e) => stringValue(property(e, 'path')) === routePath)) {
    throw new Error(`${routesFile} already has a '${routePath}' route`);
  }
  // a feature generated --requiresLogin guards the shell route, which covers every page
  if (login && property(shell, 'canActivate')?.getText().includes('AuthGuards.authGuard')) {
    route.splice(route.indexOf('canActivate: [AuthGuards.authGuard]'), 1);
  }
  tree.write(
    routesFile,
    insertIntoArray(source, children, `{ ${route.join(', ')} }`, routePath.includes(':') ? 'end' : 'start'),
  );
  addNamedImport(tree, routesFile, pageClass, `./pages/${pageFolder}/${pageFolder}.component`);
  if (route.includes('canActivate: [AuthGuards.authGuard]')) {
    addNamedImport(tree, routesFile, 'AuthGuards', '@ttrpg-ui/features/auth/util');
  }
  if (resources) addNamedImport(tree, routesFile, lib.vars.resourcesConst as string, dataAccess.importPath);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
  return () => {
    logger.info(`Created ${pageClass} at /${lib.scope}/${lib.name}${routePath ? `/${routePath}` : ''}.`);
  };
}

export default pageGenerator;
