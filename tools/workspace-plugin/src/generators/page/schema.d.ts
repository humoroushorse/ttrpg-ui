export type PageType = 'view-all' | 'view' | 'create' | 'edit' | 'blank';

export interface PageGeneratorSchema {
  /** The feature, plural: classes */
  name: string;
  scope: string;
  type: PageType;
  /** A blank page's name: builder */
  page?: string;
  /** The route path under the feature, overriding the type's default */
  path?: string;
  /** A dnd catalog entity: :source/:slug paths, catalog columns */
  catalog?: boolean;
  singular?: string;
  skipFormat?: boolean;
}
