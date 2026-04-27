import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  addEntity,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { SharedModels } from '@ttrpg-ui/shared/models';

const {
  getBaseStateWithPaginationDefault,
  setError,
  setLoaded,
  setLoading,
  setPagination,
  setSelectedEntity,
  withComputedBase,
  withComputedPagination,
} = SharedModels.Store;

import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { ProjectApiService } from '../service/project-api.service';

type Project = SprintModels.Project.Project;
type CreateProjectRequest = SprintModels.Project.CreateProjectRequest;
type UpdateProjectRequest = SprintModels.Project.UpdateProjectRequest;

export const ProjectStore = signalStore(
  { providedIn: 'root' },
  withState({
    ...getBaseStateWithPaginationDefault<Project>(),
  }),
  withEntities<Project>(),
  withComputedBase<Project>(),
  withComputedPagination(),
  withComputed((store) => ({
    projectsSorted: computed(() =>
      [...store.entities()].sort((a, b) => a.name.localeCompare(b.name))
    ),
  })),
  withMethods((store, apiService = inject(ProjectApiService)) => ({
    loadProjects: rxMethod<{ page?: number; pageSize?: number }>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap(({ page = 1, pageSize = 25 }) =>
          apiService.getProjects(page, pageSize).pipe(
            tapResponse({
              next: (response) => {
                patchState(
                  store,
                  setAllEntities(response.items),
                  setPagination(response.page, response.page_size, response.total),
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
                    error.error?.detail || 'Failed to load projects'
                  )
                );
              },
            })
          )
        )
      )
    ),

    loadProject: rxMethod<string>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap((id) =>
          apiService.getProject(id).pipe(
            tapResponse({
              next: (project) => {
                patchState(
                  store,
                  addEntity(project),
                  setSelectedEntity(project),
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
                    error.error?.detail || 'Failed to load project'
                  )
                );
              },
            })
          )
        )
      )
    ),

    loadProjectByKey: rxMethod<string>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap((key) =>
          apiService.getProjectByKey(key).pipe(
            tapResponse({
              next: (project) => {
                patchState(
                  store,
                  addEntity(project),
                  setSelectedEntity(project),
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
                    error.error?.detail || 'Failed to load project'
                  )
                );
              },
            })
          )
        )
      )
    ),

    create: rxMethod<CreateProjectRequest>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap((request) =>
          apiService.createProject(request).pipe(
            tapResponse({
              next: (project) => {
                patchState(
                  store,
                  addEntity(project),
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
                    error.error?.detail || 'Failed to create project'
                  )
                );
              },
            })
          )
        )
      )
    ),

    update: rxMethod<{ id: string; request: UpdateProjectRequest }>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap(({ id, request }) =>
          apiService.updateProject(id, request).pipe(
            tapResponse({
              next: (project) => {
                patchState(
                  store,
                  updateEntity({ id: project.id, changes: project }),
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
                    error.error?.detail || 'Failed to update project'
                  )
                );
              },
            })
          )
        )
      )
    ),

    delete: rxMethod<string>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap((id) =>
          apiService.deleteProject(id).pipe(
            tapResponse({
              next: () => {
                patchState(
                  store,
                  removeEntity(id),
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
                    error.error?.detail || 'Failed to delete project'
                  )
                );
              },
            })
          )
        )
      )
    ),

    selectProject: (project: Project | null) => {
      patchState(store, setSelectedEntity(project));
    },

    setPage: (page: number) => {
      patchState(store, {
        pagination: { ...store.pagination(), currentPage: page },
      });
    },

    setPageSize: (pageSize: number) => {
      patchState(store, {
        pagination: { ...store.pagination(), pageSize, currentPage: 1 },
      });
    },
  }))
);
