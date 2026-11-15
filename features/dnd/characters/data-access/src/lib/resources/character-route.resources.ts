import { inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { nonBlocking, ResourceContext } from '@angular/router';
import { DndCharacterApiService } from '../services/characters-api.service';

/** `?level=` as a planned level to preview, or undefined for the current level */
const levelParam = (value: unknown): number | undefined => {
  const level = Number(value);
  return Number.isInteger(level) && level >= 1 && level <= 20 ? level : undefined;
};

/**
 * Route `resources` for `characters/:id`, bound to the page's inputs of the same names: the
 * character's build and its computed sheet. `?level=` computes the sheet at another planned level.
 * Non-blocking: the page shows right away and renders each resource's loading and error states.
 */
export const characterRouteResources = (ctx: ResourceContext) => {
  const api = inject(DndCharacterApiService);
  const id = () => (ctx.params()['id'] as string | undefined) || undefined;
  const character = rxResource({
    params: id,
    stream: ({ params }) => api.getById(params),
  });
  const sheet = rxResource({
    params: () => {
      const characterId = id();
      return characterId ? { id: characterId, level: levelParam(ctx.queryParams()['level']) } : undefined;
    },
    stream: ({ params }) => api.getSheet(params.id, params.level),
  });
  return { character: nonBlocking(character), sheet: nonBlocking(sheet) };
};
