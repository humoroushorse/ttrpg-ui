import { inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { nonBlocking, ResourceContext } from '@angular/router';
import { DndFeatApiService } from '../services/feats-api.service';

/**
 * Route `resources` for `feats/:source/:slug`, bound to the page's input of the same name.
 * Non-blocking: the page shows right away and renders the resource's loading and error states.
 */
export const featRouteResources = (ctx: ResourceContext) => {
  const api = inject(DndFeatApiService);
  const feat = rxResource({
    params: () => {
      const { source, slug } = ctx.params();
      return source && slug ? { source: source as string, slug: slug as string } : undefined;
    },
    stream: ({ params }) => api.getBySlugs(params.source, params.slug),
  });
  return { feat: nonBlocking(feat) };
};
