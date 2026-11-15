import { formatFiles, getProjects, joinPathFragments, logger, ProjectConfiguration, Tree } from '@nx/devkit';
import * as ts from 'typescript';
import { libraryGenerator } from '../library/generator';
import { LIBRARY_TYPES, libraryNames } from '../library/names';
import type { LibraryType } from '../library/schema';
import { pageGenerator, titleCase } from '../page/generator';
import {
  addNamedImport,
  arrayOfConst,
  arrayOfField,
  arrayOfProperty,
  insertIntoArray,
  objectOfConst,
  property,
  readSource,
  stringValue,
} from '../../utils/ast';
import type { FeatureGeneratorSchema } from './schema';

type FeaturePage = NonNullable<FeatureGeneratorSchema['pages']>[number];

/** create and edit first, so view-all and view are made with links to them */
const PAGE_ORDER: FeaturePage[] = ['create', 'edit', 'view', 'view-all'];

/** A CLI list arrives as an array or "a,b"; undefined means "use the default" */
function list<T extends string>(value: T[] | string | undefined): T[] | undefined {
  if (value === undefined) return undefined;
  return (typeof value === 'string' ? value.split(',') : value).map((v) => v.trim() as T).filter(Boolean);
}

/**
 * A feature's libraries (models first, since the others import it), its pages, and the app wiring.
 * Each piece is the library or page generator's output; this only picks them and wires the app.
 */
export async function featureGenerator(tree: Tree, options: FeatureGeneratorSchema) {
  const location = options.location ?? 'features';
  const models = libraryNames({ ...options, location, type: 'models' });
  const api = models.api;

  const types =
    list<LibraryType>(options.types) ?? LIBRARY_TYPES.filter((t) => location === 'features' || t !== 'feature-shell');
  const unknown = types.filter((t) => !LIBRARY_TYPES.includes(t));
  if (unknown.length) throw new Error(`Unknown --types: ${unknown.join(', ')} (use ${LIBRARY_TYPES.join(', ')})`);
  const hasShell = types.includes('feature-shell');

  const readPages: FeaturePage[] = ['view', 'view-all'];
  const pages =
    list<FeaturePage>(options.pages) ?? (hasShell && api ? (options.readOnly ? readPages : PAGE_ORDER) : []);
  const badPage = pages.find((p) => !PAGE_ORDER.includes(p));
  if (badPage) throw new Error(`Unknown --pages value ${badPage} (use ${PAGE_ORDER.join(', ')})`);
  if (pages.length && !(hasShell && api && location === 'features')) {
    throw new Error('Pages need a features feature-shell with the API pieces (types incl. feature-shell, api on).');
  }
  const writePage = pages.find((p) => !readPages.includes(p));
  if (options.readOnly && writePage) {
    throw new Error(`--readOnly has no store writes, so no ${writePage} page (use --pages=view-all,view)`);
  }

  const app =
    hasShell && location === 'features' && !options.skipApp ? findApp(tree, options.app, models.scope) : undefined;

  const callbacks: (() => void)[] = [];
  for (const type of LIBRARY_TYPES.filter((t) => types.includes(t))) {
    callbacks.push(await libraryGenerator(tree, { ...options, location, type, skipFormat: true }));
  }
  for (const type of PAGE_ORDER.filter((p) => pages.includes(p))) {
    callbacks.push(
      await pageGenerator(tree, {
        name: models.name,
        scope: models.scope,
        singular: options.singular,
        catalog: options.catalog,
        type,
        skipFormat: true,
      }),
    );
  }
  const wired = app ? wireApp(tree, app, options, pages) : [];

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
  return () => {
    callbacks.forEach((callback) => callback());
    if (wired.length) logger.info(`Wired into ${app?.name}: ${wired.join('; ')}.`);
    logger.info(
      `Next: fill in ${models.vars.Singular}Schema (${models.directory}/src/lib/${models.name}.model.ts) ` +
        `from the API's OpenAPI schema${pages.includes('view-all') ? ', then the view-all page columns' : ''}.`,
    );
  };
}

/** The app to wire into: --app, or the app named like the scope if there is one */
function findApp(tree: Tree, name: string | undefined, scope: string): ProjectConfiguration | undefined {
  const projects = getProjects(tree);
  const project = projects.get(name ?? scope);
  if (project?.projectType === 'application') return project;
  if (name) throw new Error(`--app ${name} isn't an application in this workspace`);
  logger.warn(`No app named ${scope}: the feature isn't wired into one. Pass --app, or add its route yourself.`);
  return undefined;
}

/** Adds the route, the API config provider, the nav entries and the sitemap entry. Returns what it did. */
function wireApp(
  tree: Tree,
  app: ProjectConfiguration,
  options: FeatureGeneratorSchema,
  pages: FeaturePage[],
): string[] {
  const shell = libraryNames({ ...options, location: 'features', type: 'feature-shell' });
  const v = shell.vars;
  const appDir = joinPathFragments(app.sourceRoot ?? `${app.root}/src`, 'app');
  const done: string[] = [];

  // route: first, so it wins over a broader `<scope>` route (dnd's spells routes end in `**`)
  const routesFile = joinPathFragments(appDir, 'app.routes.ts');
  const routes = readSource(tree, routesFile);
  const appRoutes = arrayOfConst(routes, 'appRoutes');
  const routePath = `${shell.scope}/${shell.name}`;
  if (appRoutes.elements.some((e) => stringValue(property(e, 'path')) === routePath)) {
    throw new Error(`${routesFile} already has a '${routePath}' route`);
  }
  const route = `{ path: '${routePath}', loadChildren: () => import('${shell.importPath}').then((m) => m.${v.routesConst}) }`;
  tree.write(routesFile, insertIntoArray(routes, appRoutes, route, 'start'));
  done.push(`route /${routePath} (${routesFile})`);

  // API config provider, next to the other API config providers
  if (shell.api) {
    const configFile = joinPathFragments(appDir, 'app.config.ts');
    const config = readSource(tree, configFile);
    if (!config.getFullText().includes('AppConfigService')) {
      logger.warn(`${configFile} doesn't use AppConfigService: provide ${v.tokenName} yourself.`);
    } else {
      const providers = arrayOfProperty(objectOfConst(config, 'appConfig'), 'providers');
      if (!providers) throw new Error(`${configFile}: no appConfig.providers array`);
      const provider =
        `{ provide: ${v.modelsNamespace}.Service.${v.tokenName}, ` +
        `useFactory: (appConfigService: AppConfigService) => ({ appConfig: appConfigService.appConfig, initialized: appConfigService.initialized }), ` +
        `deps: [AppConfigService] }`;
      const isApiConfig = (e: ts.Expression) =>
        /_API_SERVICE_CONFIG_TOKEN$/.test(property(e, 'provide')?.getText() ?? '');
      tree.write(configFile, insertIntoArray(config, providers, provider, { after: isApiConfig }));
      addNamedImport(tree, configFile, v.modelsNamespace as string, v.modelsImport as string);
      done.push(`${v.tokenName} provider (${configFile})`);
    }
    const appConfigModel = joinPathFragments(appDir, 'models/models.ts');
    if (!tree.read(appConfigModel, 'utf-8')?.includes(`${v.apiBasePathKey}`)) {
      logger.warn(
        `${v.apiBasePathKey} isn't in ${appConfigModel}: add it to AppConfig and the app's assets/app.config*.json.`,
      );
    }
  }

  // nav entries in the sidenav group
  const entries = [
    pages.includes('create') &&
      `{ viewValue: 'Create ${titleCase(shell.singular)}', path: ['${shell.scope}', '${shell.name}', 'create'], icon: 'add', requiresLogin: true }`,
    pages.includes('view-all') &&
      `{ viewValue: 'View ${titleCase(shell.name)}', path: ['${shell.scope}', '${shell.name}']${options.requiresLogin ? ', requiresLogin: true' : ''} }`,
  ].filter((e): e is string => !!e);
  if (entries.length) {
    const componentFile = joinPathFragments(appDir, 'app.component.ts');
    const groups = arrayOfField(readSource(tree, componentFile), 'defaultRoutes').elements;
    const group = options.navGroup
      ? groups.find((g) => stringValue(property(g, 'viewValue')) === options.navGroup)
      : groups[0];
    if (!group) throw new Error(`${componentFile}: no nav group '${options.navGroup}' in defaultRoutes`);
    const groupName = stringValue(property(group, 'viewValue'));
    for (const entry of entries) {
      // re-read: each insert moves the positions
      const source = readSource(tree, componentFile);
      const target = arrayOfField(source, 'defaultRoutes').elements.find(
        (g) => stringValue(property(g, 'viewValue')) === groupName,
      );
      const children = target && ts.isObjectLiteralExpression(target) ? arrayOfProperty(target, 'children') : undefined;
      if (!children) throw new Error(`${componentFile}: nav group '${groupName}' has no children array`);
      tree.write(componentFile, insertIntoArray(source, children, entry, 'end'));
    }
    done.push(`nav entries in '${groupName}' (${componentFile})`);
  }

  // sitemap: the list page, like the other entries
  const sitemapFile = joinPathFragments(app.sourceRoot ?? `${app.root}/src`, 'sitemap.xml');
  const sitemap = tree.read(sitemapFile, 'utf-8');
  const origin = sitemap?.match(/<loc>(https?:\/\/[^/<]+)/)?.[1];
  // a page behind a login has nothing for a search engine
  if (sitemap && origin && pages.includes('view-all') && !options.requiresLogin) {
    const url = `  <url>\n    <loc>${origin}/${routePath}</loc>\n    <priority>0.8</priority>\n  </url>\n`;
    tree.write(sitemapFile, sitemap.replace('</urlset>', `${url}</urlset>`));
    done.push(`sitemap entry (${sitemapFile})`);
  }
  return done;
}

export default featureGenerator;
