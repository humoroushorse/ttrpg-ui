import { names } from '@nx/devkit';
import type { LibraryGeneratorSchema, LibraryLocation, LibraryType } from './schema';

export const LIBRARY_TYPES: LibraryType[] = ['models', 'data-access', 'ui', 'util', 'testing', 'feature-shell'];

/** Plurals whose singular isn't the plural minus its ending */
const IRREGULAR: Record<string, string> = { species: 'species', series: 'series', people: 'person' };

/** Words that can't be a variable name */
const RESERVED = new Set(
  (
    'break case catch class const continue debugger default delete do else enum export extends false finally for ' +
    'function if import in instanceof let new null package private protected public return static super switch ' +
    'this throw true try typeof var void while with yield interface implements await'
  ).split(' '),
);

/** The singular as a variable name: class -> dndClass (reserved), character -> character */
function singularVariable(singular: string, scope: string): string {
  const prop = names(singular).propertyName;
  return RESERVED.has(prop) ? `${names(scope).propertyName}${names(singular).className}` : prop;
}

/** classes -> class, abilities -> ability, characters -> character; --singular covers the rest */
export function singularize(plural: string): string {
  if (IRREGULAR[plural]) return IRREGULAR[plural];
  if (plural.endsWith('ies')) return `${plural.slice(0, -3)}y`;
  if (/(ss|ch|sh|x|z)es$/.test(plural)) return plural.slice(0, -2);
  if (plural.endsWith('s') && !plural.endsWith('ss')) return plural.slice(0, -1);
  return plural;
}

/** Everything a library's path, project and starter files are named from */
export interface LibraryNames {
  type: LibraryType;
  location: LibraryLocation;
  /** dnd; "shared" for a shared library */
  scope: string;
  /** characters (kebab, as given) */
  name: string;
  /** character */
  singular: string;
  /** features/dnd/characters/models */
  directory: string;
  /** dnd-characters-models */
  projectName: string;
  /** @ttrpg-ui/features/dnd/characters/models */
  importPath: string;
  api: boolean;
  /** a dnd catalog entity: source + slug URLs, the shared catalog fields */
  catalog: boolean;
  /** EJS substitutions for the starter files */
  vars: Record<string, string | boolean>;
}

/** The directory, project name and import path of a sibling library of another type */
export function siblingOf(lib: Pick<LibraryNames, 'location' | 'scope' | 'name'>, type: LibraryType) {
  const directory =
    lib.location === 'shared' ? `shared/${lib.name}/${type}` : `features/${lib.scope}/${lib.name}/${type}`;
  const projectName = lib.location === 'shared' ? `shared-${lib.name}-${type}` : `${lib.scope}-${lib.name}-${type}`;
  return { directory, projectName, importPath: `@ttrpg-ui/${directory}` };
}

export function libraryNames(options: LibraryGeneratorSchema): LibraryNames {
  const type = options.type;
  if (!LIBRARY_TYPES.includes(type)) {
    throw new Error(`--type must be one of ${LIBRARY_TYPES.join(', ')} (got ${type})`);
  }
  const location: LibraryLocation = options.location ?? 'features';
  const name = names(options.name).fileName;
  const scope = location === 'shared' ? 'shared' : names(options.scope ?? '').fileName;
  if (!scope) {
    throw new Error(
      '--scope is required for a features library: the area it belongs to (dnd, auth, sprint-management)',
    );
  }
  const singular = options.singular ? names(options.singular).fileName : singularize(name);
  const api = options.api ?? location === 'features';
  const catalog = options.catalog ?? false;
  if (catalog && (location !== 'features' || !api)) {
    throw new Error('--catalog is for a features entity with the API pieces (not --location=shared, not --no-api)');
  }
  const { directory, projectName, importPath } = siblingOf({ location, scope, name }, type);

  const Scope = names(scope).className;
  const Plural = names(name).className;
  const Singular = names(singular).className;
  const SINGULAR = names(singular).constantName;
  // DndSpellModels for a feature; TableModels for shared (the existing namespaces' style)
  const modelsNamespace = location === 'shared' ? `${Plural}Models` : `${Scope}${Singular}Models`;
  const entityPrefix = location === 'shared' ? '' : Scope;

  return {
    type,
    location,
    scope,
    name,
    singular,
    directory,
    projectName,
    importPath,
    api,
    catalog,
    vars: {
      type,
      location,
      scope,
      Scope,
      name,
      Plural,
      plural: names(name).propertyName,
      singular,
      Singular,
      singularProp: singularVariable(singular, scope),
      // the article for the singular in comments and descriptions: an item, a class
      a: /^[aeiou]/.test(singular) ? 'an' : 'a',
      A: /^[aeiou]/.test(singular) ? 'An' : 'A',
      projectName,
      importPath,
      api,
      readOnly: options.readOnly ?? false,
      requiresLogin: options.requiresLogin ?? false,
      catalog,
      modelsNamespace,
      modelsImport: siblingOf({ location, scope, name }, 'models').importPath,
      serviceClass: `${entityPrefix}${Singular}ApiService`,
      plainServiceClass: `${entityPrefix || 'Shared'}${Plural}Service`,
      storeName: `${entityPrefix}${Plural}Store`,
      configInterface: `${entityPrefix}${Singular}ApiServiceConfig`,
      tokenName: `${entityPrefix ? `${names(scope).constantName}_` : ''}${SINGULAR}_API_SERVICE_CONFIG_TOKEN`,
      apiPath: options.apiPath ?? `/${name}`,
      apiBasePathKey: options.apiBasePathKey ?? `APP_TTRPG_${names(scope).constantName}__API_BASE_PATH`,
      routesConst: `${names(scope).propertyName}${Plural}Routes`,
      shellClass: `${Scope}${Plural}ShellComponent`,
      shellSelector: `lib-${scope}-${name}-shell`,
      resourcesConst: `${names(singular).propertyName}RouteResources`,
      routeFn: `${names(singular).propertyName}Route`,
    },
  };
}
