import { effect, EffectRef, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';

export interface PageMeta {
  /** Most specific first, e.g. ['Wizard', 'Classes']. The app title is added at the end. */
  title: string[];
  /** The meta description search results show */
  description: string;
}

/**
 * Sets the document title ("Wizard | Classes | TTRPG") and meta description, and updates them
 * when the signals `read` uses change. Call it in a component's constructor or a field initializer.
 */
export function pageMeta(read: () => PageMeta): EffectRef {
  const title = inject(Title);
  const meta = inject(Meta);
  const appTitle = inject(SHARED_CORE_SERVICE_CONFIG_TOKEN).appTitle;
  // the document head lives outside Angular's templates, so it needs an effect
  return effect(() => {
    const page = read();
    title.setTitle([...page.title, appTitle].join(' | '));
    meta.updateTag({ name: 'description', content: page.description });
  });
}
