import { inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { nonBlocking, ResourceContext } from '@angular/router';
import { DndSpellApiService } from '../services/dnd-spells-api.service';

/**
 * Route `resources` for `spells/:source/:slug`, bound to the page's inputs of the same name.
 * Non-blocking: the page shows right away and renders each resource's loading/error state.
 */
export const spellRouteResources = (ctx: ResourceContext) => {
  const api = inject(DndSpellApiService);
  const spell = rxResource({
    params: () => {
      const { source, slug } = ctx.params();
      return source && slug ? { source: source as string, slug: slug as string } : undefined;
    },
    stream: ({ params }) => api.getBySlugs(params.source, params.slug),
  });
  // waits on `spell`; idle while it has no value
  const versions = rxResource({
    params: ({ chain }) => chain(spell)?.slug,
    stream: ({ params: slug }) => api.getVersions(slug),
  });
  return { spell: nonBlocking(spell), versions: nonBlocking(versions) };
};
