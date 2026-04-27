import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { SprintStore } from '@ttrpg-ui/features/sprint-management/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { FilterType, FilterCondition } = SprintModels.Filter;
const { SprintStatus } = SprintModels.Sprint;
import { filter, take } from 'rxjs';

export const boardResolver: ResolveFn<void> = () => {
  const sprintStore = inject(SprintStore);

  sprintStore.loadSprints({
    page: 1,
    page_size: 10,
    filters: [
      {
        field: 'status',
        type: FilterType.Text,
        condition: FilterCondition.Equals,
        value: SprintStatus.Active,
      },
    ],
    sort: [],
  });

  // Wait for loaded
  return new Promise<void>((resolve) => {
    toObservable(sprintStore.loaded)
      .pipe(
        filter((loaded) => loaded === true),
        take(1),
      )
      .subscribe(() => resolve());
  });
};
