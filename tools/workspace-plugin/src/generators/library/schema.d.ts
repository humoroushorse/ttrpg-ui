export type LibraryType = 'models' | 'data-access' | 'ui' | 'util' | 'testing' | 'feature-shell';

export type LibraryLocation = 'features' | 'shared';

export interface LibraryGeneratorSchema {
  name: string;
  type: LibraryType;
  location?: LibraryLocation;
  scope?: string;
  singular?: string;
  api?: boolean;
  apiPath?: string;
  apiBasePathKey?: string;
  readOnly?: boolean;
  requiresLogin?: boolean;
  catalog?: boolean;
  skipFormat?: boolean;
}
