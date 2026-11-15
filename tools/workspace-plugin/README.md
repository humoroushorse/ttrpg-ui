# @ttrpg-ui/workspace-plugin

This workspace's Nx generators. They call `@nx/angular`'s library generator for the project itself (project.json, tsconfig, eslint config, the `tsconfig.base.json` alias), then add this workspace's folder layout, names, `scope:`/`type:` tags and starter files. Wrapping Nx instead of owning those files keeps them in step with `nx migrate`.

Run from `ttrpg-ui`. Add `--dry-run` to preview.

## feature

A new entity or area in one go: its libraries (models first, since the rest import it), its pages, and the app wiring.

```bash
npm exec nx -- g @ttrpg-ui/workspace-plugin:feature gadgets --scope=dnd --no-interactive
# a dnd catalog entity, reads only, just the libraries it needs (how classes was made)
npm exec nx -- g @ttrpg-ui/workspace-plugin:feature classes --scope=dnd --catalog --readOnly --types=models,data-access,feature-shell --no-interactive
```

- `--types` (default: all six; all but feature-shell for shared): `models,data-access,ui,util,testing,feature-shell`. Ask for only what's used; add a library later with `library`.
- `--pages` (default: all four with a feature-shell and the API pieces; view-all and view with `--readOnly`): `view-all,view,create,edit`
- `--readOnly`: the API service gets list and get, the store has no writes
- `--requiresLogin`: private data. The auth guard goes on the feature's shell route (so every page needs a login), the nav entries show only when logged in, and there's no sitemap entry
- `--catalog`: a dnd catalog entity (classes, species, backgrounds, feats, subclasses, items, conditions, glossary). Pages live at `:source/:slug` (`/dnd/classes/phb_2024/wizard`); the models get the shared catalog fields and `SourceRef`; the API service gets `getBySlugs` and sends `?fields=` on the list (classes: 11 KB a page instead of 1.5 MB); view-all gets the source and edition columns
- `--api` (default: on for features, off for shared), `--apiPath` (default `/<name>`), `--apiBasePathKey` (default `APP_TTRPG_<SCOPE>__API_BASE_PATH`)
- `--app` (default: the app named like the scope), `--skipApp`, `--navGroup` (default: the app's first sidenav group)
- `--singular` when the plural's ending doesn't give it (species, people)

App wiring, when there's a feature-shell and an app:

| File                   | Change                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `app/app.routes.ts`    | `<scope>/<name>` lazy route, first (dnd's `dnd` route ends in `**`)                  |
| `app/app.config.ts`    | the API config token provider from `AppConfigService`, after the other API providers |
| `app/app.component.ts` | "Create X" and "View Xs" in the sidenav group                                        |
| `sitemap.xml`          | the list page                                                                        |

It warns when the API base path key isn't in the app's `AppConfig`.

## library

One library of one type.

```bash
npm exec nx -- g @ttrpg-ui/workspace-plugin:library classes --type=ui --scope=dnd --no-interactive
npm exec nx -- g @ttrpg-ui/workspace-plugin:library table --type=util --location=shared --no-interactive
```

| Type          | Starter files                                                                                                                                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| models        | `<Singular>Schema`, entity id selectors, `<singular>Route()`; with the API, the API config token; with `--catalog`, the shared catalog fields, `SourceRef` and a source/slug route                                                                           |
| data-access   | with the API: API service (list/get/create/patch/delete), list store (server paging, sort, filters, create/update/delete), route resources; `--readOnly` drops the writes; `--catalog` adds `getBySlugs` and `LIST_FIELDS`; without the API: a plain service |
| ui            | an empty index                                                                                                                                                                                                                                               |
| util          | an empty index                                                                                                                                                                                                                                               |
| testing       | a `<singular>` factory; with the API, a test provider for the config token                                                                                                                                                                                   |
| feature-shell | shell component and `lib.routes.ts` with an empty `children`                                                                                                                                                                                                 |

data-access and testing need the models library first. Generated libraries have no test target until one is needed.

## page

A page in a feature-shell made by this plugin, with its route added to `lib.routes.ts`. Static paths go first in `children`, so `create` isn't read as an `:id`.

```bash
npm exec nx -- g @ttrpg-ui/workspace-plugin:page classes --scope=dnd --type=view --no-interactive
npm exec nx -- g @ttrpg-ui/workspace-plugin:page characters --scope=dnd --type=blank --page=builder --no-interactive
```

| Type     | Path                                     | What it is                                                                                                   |
| -------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| view-all | `''`                                     | shared table with server paging, saved column layout; double-click opens the view page                       |
| view     | `:id` (`:source/:slug` with `--catalog`) | route resources, keeps the last value while the next loads, 404 message, the entity as JSON, Edit and Delete |
| create   | `create`                                 | login required; a JSON body textarea through the store's `create`                                            |
| edit     | `:id/edit` (`:source/:slug/edit`)        | login required; route resources, the loaded entity as JSON, through the store's `update`                     |
| blank    | `<page>`                                 | a titled empty page                                                                                          |

Every page sets its title and description with `pageMeta` (`@ttrpg-ui/shared/core/util`); catalog pages say "D&D" ("Barbarian (PHB 2024) \| D&D Classes \| TTRPG"). Pages link to what exists when they're generated: view-all's Create button and view's Edit need those pages (the feature generator makes create and edit first), and view's Delete needs a store with `delete`. create and edit fail on a read-only store. Pass `--catalog` for a catalog feature's pages.

## Tags and import rules

The rules live in `ttrpg-ui/eslint.config.mjs` (`scopeRules`, `typeRules`) and run with lint. `npm exec nx run workspace-plugin:check-tags` fails if a project lacks exactly one known `scope:` and `type:` tag. A new scope needs an entry in `scopeRules`.

Projects that broke the rules before they existed opt into looser ones with `legacyBoundaries` in their own eslint config (listed in `TODO.md`).

## Guard

`scripts/guard-project-json.mjs` is a Kiro PreToolUse hook (`.kiro/hooks/ttrpg-ui-generators-first.json` at the repo root) that blocks writing a new `ttrpg-ui/**/project.json` by hand.

## Developing

```bash
npm exec nx run workspace-plugin:typecheck
npm exec nx lint workspace-plugin
npm exec nx -- list @ttrpg-ui/workspace-plugin
```

Templates are EJS (`files/**/*.template`), excluded from typecheck and lint. Each generate run prints a harmless "Failed to load the ES module" warning while Nx falls back to transpiling the TypeScript.
