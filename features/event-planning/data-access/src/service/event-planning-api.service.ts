import { inject, Injectable } from '@angular/core';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';

@Injectable({
  providedIn: 'root',
})
export class EventPlanningApiService {
  public serviceConfig: EventPlanningModels.Service.EventPlanningApiServiceConfig = inject(
    EventPlanningModels.Service.EVENT_PLANNING_API_SERVICE_CONFIG_TOKEN,
  );
}
