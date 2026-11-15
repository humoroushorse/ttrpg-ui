import { formatFiles, generateFiles, getProjects, joinPathFragments, logger, Tree } from '@nx/devkit';
import { libraryGenerator as angularLibraryGenerator } from '@nx/angular/generators';
import { existsSync } from 'fs';
import * as path from 'path';
import { libraryNames, siblingOf } from './names';
import type { LibraryGeneratorSchema, LibraryType } from './schema';

type AngularLibraryOptions = Parameters<typeof angularLibraryGenerator>[1];

/** Types whose starter files import the sibling models library */
const NEEDS_MODELS: LibraryType[] = ['data-access', 'testing'];

/**
 * A library in this workspace's layout. Nx's Angular library generator creates the project
 * (project.json, tsconfig, eslint config, the tsconfig.base.json alias); this adds the folder, name,
 * tags and starter files for the type.
 */
export async function libraryGenerator(tree: Tree, options: LibraryGeneratorSchema) {
  const lib = libraryNames(options);
  const projects = getProjects(tree);
  if (projects.has(lib.projectName)) {
    throw new Error(`Project ${lib.projectName} already exists (${projects.get(lib.projectName)?.root})`);
  }
  if (tree.exists(lib.directory)) {
    throw new Error(`${lib.directory} already exists`);
  }
  const models = siblingOf(lib, 'models');
  if (NEEDS_MODELS.includes(lib.type) && !projects.has(models.projectName)) {
    throw new Error(
      `A ${lib.type} library imports ${models.importPath}: generate the models library first ` +
        `(--type models), or use the feature generator to create them together.`,
    );
  }

  const installTask = await angularLibraryGenerator(tree, {
    directory: lib.directory,
    name: lib.projectName,
    importPath: lib.importPath,
    tags: `scope:${lib.scope},type:${lib.type}`,
    prefix: 'lib',
    // no module and no placeholder component; the starter files below replace Nx's
    standalone: false,
    skipModule: true,
    strict: true,
    style: 'scss',
    linter: 'eslint',
    // library tests: none until one is needed (the enum isn't exported, so its value by type)
    unitTestRunner: 'none' as AngularLibraryOptions['unitTestRunner'],
    skipPackageJson: true,
    skipFormat: true,
  });

  // files/<type>/common always; files/<type>/api or no-api on top (each folder only if the type has it)
  const files = path.join(__dirname, 'files', lib.type);
  for (const folder of ['common', lib.api ? 'api' : 'no-api']) {
    if (existsSync(path.join(files, folder))) {
      generateFiles(tree, path.join(files, folder), lib.directory, lib.vars);
    }
  }
  generateFiles(tree, path.join(__dirname, 'files', 'readme'), lib.directory, lib.vars);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
  return () => {
    installTask();
    logger.info(
      `Created ${lib.projectName} (${joinPathFragments(lib.directory)}), import it as ${lib.importPath}. ` +
        `Tags: scope:${lib.scope}, type:${lib.type}.`,
    );
  };
}

export default libraryGenerator;
