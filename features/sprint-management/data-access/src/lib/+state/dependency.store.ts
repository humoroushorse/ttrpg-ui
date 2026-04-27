import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  addEntity,
  removeEntity,
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { SprintManagementApiService } from '../service/sprint-management-api.service';

type Dependency = SprintModels.Dependency.Dependency;
type DependencyType = SprintModels.Dependency.DependencyType;

const {
  getBaseStateDefault,
  setError,
  setLoaded,
  setLoading,
  withComputedBase,
} = SharedModels.Store;

export const DependencyStore = signalStore(
  { providedIn: 'root' },
  withState(getBaseStateDefault<Dependency>()),
  withEntities<Dependency>(),
  withComputedBase<Dependency>(),
  withMethods((store, apiService = inject(SprintManagementApiService)) => ({
    loadDependencies: rxMethod<string>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap((workItemId) =>
          apiService.getDependencies(workItemId).pipe(
            tapResponse({
              next: (dependencies) => {
                patchState(
                  store,
                  setAllEntities(dependencies),
                  setLoaded(true),
                  setLoading(false),
                  setError(null, null)
                );
              },
              error: (error: any) => {
                patchState(
                  store,
                  setLoading(false),
                  setError(
                    error.message,
                    error.error?.detail || 'Failed to load dependencies'
                  )
                );
              },
            })
          )
        )
      )
    ),

    createDependency: rxMethod<{
      workItemId: string;
      targetId: string;
      type: DependencyType;
    }>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap(({ workItemId, targetId, type }) =>
          apiService.createDependency(workItemId, targetId, type).pipe(
            tapResponse({
              next: (dependency) => {
                patchState(
                  store,
                  addEntity(dependency),
                  setLoading(false),
                  setError(null, null)
                );
              },
              error: (error: any) => {
                patchState(
                  store,
                  setLoading(false),
                  setError(
                    error.message,
                    error.error?.detail || 'Failed to create dependency'
                  )
                );
              },
            })
          )
        )
      )
    ),

    deleteDependency: rxMethod<{ workItemId: string; dependencyId: string }>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap(({ workItemId, dependencyId }) =>
          apiService.deleteDependency(workItemId, dependencyId).pipe(
            tapResponse({
              next: () => {
                patchState(
                  store,
                  removeEntity(dependencyId),
                  setLoading(false),
                  setError(null, null)
                );
              },
              error: (error: any) => {
                patchState(
                  store,
                  setLoading(false),
                  setError(
                    error.message,
                    error.error?.detail || 'Failed to delete dependency'
                  )
                );
              },
            })
          )
        )
      )
    ),

    clearDependencies: () => {
      patchState(store, setAllEntities([] as Dependency[]));
    },
  }))
);
