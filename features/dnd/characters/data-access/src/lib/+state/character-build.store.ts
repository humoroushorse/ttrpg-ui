import { computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { concatMap, map, Observable, switchMap, tap } from 'rxjs';
import { getErrorMessage } from '@ttrpg-ui/shared/store/util';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { DndCharacterApiService } from '../services/characters-api.service';

type Character = DndCharacterModels.Characters.CharacterDetail;
type Sheet = DndCharacterModels.Sheet.CharacterSheet;

/** One build write: the API call to make, given the character's id and the version it was read at */
export type BuildWrite = (api: DndCharacterApiService, id: string, version: number) => Observable<Character>;

/**
 * The level the builder works at: the top planned level, or the current level when that's higher.
 * The sheet at it asks for every pick the plan needs.
 */
export const buildLevelOf = (character: Character): number =>
  Math.max(1, character.current_level, ...character.levels.map((l) => l.level));

interface BuildState {
  character: Character | null;
  sheet: Sheet | null;
  /** the sheet for proposed changes, before they're saved */
  preview: Sheet | null;
  previewLabel: string | null;
  /** the last labelled save, and the sheet before it (the panel shows what it changed) */
  lastSave: { label: string; before: Sheet } | null;
  loading: boolean;
  saving: boolean;
  previewing: boolean;
  error: string | null;
}

/**
 * One character being built: its build and its sheet at the build level (`buildLevelOf`), kept in
 * step. Every write sends the version it was read at (If-Match), then reloads the sheet; a write over
 * a newer version reloads both instead. Provide it in the builder page, not in root: it holds one
 * character.
 */
export const DndCharacterBuildStore = signalStore(
  withState<BuildState>({
    character: null,
    sheet: null,
    preview: null,
    previewLabel: null,
    lastSave: null,
    loading: false,
    saving: false,
    previewing: false,
    error: null,
  }),
  withComputed(({ character, sheet }) => ({
    /** choice id -> choice */
    choicesById: computed(() => new Map((character()?.choices ?? []).map((c) => [c.id, c]))),
    buildLevel: computed(() => {
      const c = character();
      return c ? buildLevelOf(c) : 1;
    }),
    /** the top planned level (0 with no class) */
    topLevel: computed(() => Math.max(0, ...(character()?.levels ?? []).map((l) => l.level))),
    /**
     * The picks no choice point asks for any more (a species changed), so they can be removed. Picks
     * at a level past the sheet's are left out: they come back when that level is planned.
     */
    orphans: computed(() => {
      const s = sheet();
      const answering = new Set((s?.choice_points ?? []).flatMap((p) => p.choice_ids ?? []));
      return (character()?.choices ?? []).filter((c) => !answering.has(c.id) && c.level <= (s?.level ?? 20));
    }),
    /** Picks made for levels that aren't planned any more (the top level was removed) */
    unplanned: computed(() => {
      const level = sheet()?.level ?? 20;
      return (character()?.choices ?? []).filter((c) => c.level > level);
    }),
  })),
  withMethods((store, api = inject(DndCharacterApiService)) => {
    const fail = (error: unknown) =>
      patchState(store, { loading: false, saving: false, previewing: false, error: getErrorMessage(error) });

    const load = rxMethod<string>(
      switchMap((id) => {
        patchState(store, { loading: true, error: null });
        // the sheet's level comes from the plan, so the character first
        return api.getById(id).pipe(
          switchMap((character) =>
            api.getSheet(id, buildLevelOf(character)).pipe(map((sheet) => ({ character, sheet }))),
          ),
          tapResponse({
            next: ({ character, sheet }) => patchState(store, { character, sheet, loading: false }),
            error: fail,
          }),
        );
      }),
    );

    return {
      load,
      /**
       * Saves one change, then reloads the sheet. Writes run in order. The call is wrapped in an
       * object because rxMethod treats a bare function as a signal to watch. With a `label`, the
       * panel shows what the save changed.
       */
      write: rxMethod<{ run: BuildWrite; label?: string }>(
        concatMap(({ run, label }) => {
          const character = store.character();
          if (!character) return [];
          const before = store.sheet();
          patchState(store, { saving: true, error: null, preview: null, previewLabel: null, lastSave: null });
          return run(api, character.id, character.version).pipe(
            tap((saved) => patchState(store, { character: saved })),
            switchMap((saved) => api.getSheet(saved.id, buildLevelOf(saved))),
            tapResponse({
              next: (sheet) =>
                patchState(store, { sheet, saving: false, lastSave: label && before ? { label, before } : null }),
              error: (error: unknown) => {
                if (
                  error instanceof HttpErrorResponse &&
                  error.status === 409 &&
                  /version/.test(getErrorMessage(error))
                ) {
                  patchState(store, {
                    saving: false,
                    error: 'The character changed somewhere else, so it was reloaded. Try again.',
                  });
                  load(character.id);
                } else {
                  fail(error);
                }
              },
            }),
          );
        }),
      ),
      /**
       * The sheet as these changes would make it (state `preview`), at `level` (default the build
       * level); `label` says what's being previewed
       */
      previewChanges: rxMethod<{
        label: string;
        operations: DndCharacterModels.Build.SheetOperation[];
        level?: number;
      }>(
        switchMap(({ label, operations, level }) => {
          const character = store.character();
          if (!character) return [];
          patchState(store, { previewing: true, previewLabel: label, lastSave: null, error: null });
          return api.preview(character.id, operations, level ?? buildLevelOf(character)).pipe(
            tapResponse({
              next: (preview) => patchState(store, { preview, previewing: false }),
              error: fail,
            }),
          );
        }),
      ),
      clearPreview: () => patchState(store, { preview: null, previewLabel: null }),
      clearError: () => patchState(store, { error: null }),
    };
  }),
);
