import { inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { nonBlocking, ResourceContext } from '@angular/router';
import { DndItemApiService } from '../services/items-api.service';

/**
 * Route `resources` for `items/:source/:slug`, bound to the page's input of the same name.
 * Non-blocking: the page shows right away and renders the resource's loading and error states.
 */
export const itemRouteResources = (ctx: ResourceContext) => {
  const api = inject(DndItemApiService);
  const item = rxResource({
    params: () => {
      const { source, slug } = ctx.params();
      return source && slug ? { source: source as string, slug: slug as string } : undefined;
    },
    stream: ({ params }) => api.getBySlugs(params.source, params.slug),
  });
  return { item: nonBlocking(item) };
};
