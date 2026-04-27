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
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { SprintManagementApiService } from '../service/sprint-management-api.service';

const {
  getBaseStateDefault,
  setError,
  setLoaded,
  setLoading,
  withComputedBase,
} = SharedModels.Store;

export const CommentStore = signalStore(
  { providedIn: 'root' },
  withState(getBaseStateDefault<SprintModels.Comment.Comment>()),
  withEntities<SprintModels.Comment.Comment>(),
  withComputedBase<SprintModels.Comment.Comment>(),
  withMethods((store, apiService = inject(SprintManagementApiService)) => ({
    loadComments: rxMethod<string>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap((workItemId) =>
          apiService.getComments(workItemId).pipe(
            tapResponse({
              next: (comments) => {
                // Sort comments by created_at (newest first)
                const sortedComments = [...comments].sort((a, b) => {
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                });

                patchState(
                  store,
                  setAllEntities(sortedComments),
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
                    error.error?.detail || 'Failed to load comments'
                  )
                );
              },
            })
          )
        )
      )
    ),

    createComment: rxMethod<{ workItemId: string; content: string }>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap(({ workItemId, content }) =>
          apiService.createComment(workItemId, content).pipe(
            tapResponse({
              next: (comment) => {
                patchState(
                  store,
                  addEntity(comment),
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
                    error.error?.detail || 'Failed to create comment'
                  )
                );
              },
            })
          )
        )
      )
    ),

    updateComment: rxMethod<{
      workItemId: string;
      commentId: string;
      content: string;
    }>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap(({ workItemId, commentId, content }) =>
          apiService.updateComment(workItemId, commentId, content).pipe(
            tapResponse({
              next: (comment) => {
                patchState(
                  store,
                  updateEntity({ id: comment.id, changes: comment }),
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
                    error.error?.detail || 'Failed to update comment'
                  )
                );
              },
            })
          )
        )
      )
    ),

    deleteComment: rxMethod<{ workItemId: string; commentId: string }>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap(({ workItemId, commentId }) =>
          apiService.deleteComment(workItemId, commentId).pipe(
            tapResponse({
              next: () => {
                patchState(
                  store,
                  removeEntity(commentId),
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
                    error.error?.detail || 'Failed to delete comment'
                  )
                );
              },
            })
          )
        )
      )
    ),

    clearComments: () => {
      patchState(store, setAllEntities([] as SprintModels.Comment.Comment[]));
    },
  }))
);
