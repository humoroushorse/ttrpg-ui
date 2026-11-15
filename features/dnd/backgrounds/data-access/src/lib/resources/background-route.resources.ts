import { inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { nonBlocking, ResourceContext } from '@angular/router';
import { DndBackgroundApiService } from '../services/backgrounds-api.service';

/**
 * Route `resources` for `backgrounds/:source/:slug`, bound to the page's input of the same name.
 * Non-blocking: the page shows right away and renders the resource's loading and error states.
 */
export const backgroundRouteResources = (ctx: ResourceContext) => {
  const api = inject(DndBackgroundApiService);
  const background = rxResource({
    params: () => {
      const { source, slug } = ctx.params();
      return source && slug ? { source: source as string, slug: slug as string } : undefined;
    },
    stream: ({ params }) => api.getBySlugs(params.source, params.slug),
  });
  return { background: nonBlocking(background) };
};
