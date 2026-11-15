import { inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { nonBlocking, ResourceContext } from '@angular/router';
import { DndCampaignApiService } from '../services/campaigns-api.service';

/**
 * Route `resources` for `campaigns/:id`, bound to the page's input of the same name.
 * Non-blocking: the page shows right away and renders the resource's loading and error states.
 */
export const campaignRouteResources = (ctx: ResourceContext) => {
  const api = inject(DndCampaignApiService);
  const campaign = rxResource({
    params: () => (ctx.params()['id'] as string | undefined) || undefined,
    stream: ({ params: id }) => api.getById(id),
  });
  return { campaign: nonBlocking(campaign) };
};
