import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY, map } from 'rxjs';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type WorkItem = SprintModels.WorkItem.WorkItem;
import { SprintManagementApiService } from '@ttrpg-ui/features/sprint-management/data-access';

export const workItemResolver: ResolveFn<WorkItem | null> = (route) => {
  const apiService = inject(SprintManagementApiService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id) {
    router.navigate(['/work-items']);
    return EMPTY;
  }

  return apiService.getWorkItem(id).pipe(
    map(workItem => workItem),
    catchError(() => {
      // If work item not found, redirect to 404
      router.navigate(['/not-found']);
      return EMPTY;
    })
  );
};
