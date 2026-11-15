import type { LibraryLocation, LibraryType } from '../library/schema';
import type { PageType } from '../page/schema';

export interface FeatureGeneratorSchema {
  name: string;
  scope?: string;
  location?: LibraryLocation;
  types?: LibraryType[];
  pages?: Exclude<PageType, 'blank'>[];
  singular?: string;
  api?: boolean;
  apiPath?: string;
  apiBasePathKey?: string;
  readOnly?: boolean;
  requiresLogin?: boolean;
  catalog?: boolean;
  app?: string;
  skipApp?: boolean;
  navGroup?: string;
  skipFormat?: boolean;
}
