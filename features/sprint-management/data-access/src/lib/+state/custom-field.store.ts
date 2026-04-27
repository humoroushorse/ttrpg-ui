import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { SprintManagementApiService } from '../service/sprint-management-api.service';

const { CustomFieldType } = SprintModels.CustomField;
type CustomFieldDefinition = SprintModels.CustomField.CustomFieldDefinition;

interface CustomFieldState {
  fields: CustomFieldDefinition[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

export const CustomFieldStore = signalStore(
  { providedIn: 'root' },
  withState<CustomFieldState>({
    fields: [],
    loading: false,
    loaded: false,
    error: null,
  }),
  withComputed(({ fields }) => ({
    fieldsByType: computed(() => {
      const map = new Map<SprintModels.CustomField.CustomFieldType, CustomFieldDefinition[]>();
      for (const type of Object.values(CustomFieldType)) {
        map.set(type, []);
      }
      for (const field of fields()) {
        const list = map.get(field.type) ?? [];
        list.push(field);
        map.set(field.type, list);
      }
      return map;
    }),
  })),
  withMethods((store, apiService = inject(SprintManagementApiService)) => ({
    loadCustomFields: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          apiService.getCustomFieldDefinitions().pipe(
            tapResponse({
              next: (fields) => {
                patchState(store, {
                  fields,
                  loading: false,
                  loaded: true,
                  error: null,
                });
              },
              error: (error: any) => {
                patchState(store, {
                  loading: false,
                  error: error.error?.detail || error.message || 'Failed to load custom fields',
                });
              },
            }),
          ),
        ),
      ),
    ),
  })),
);
