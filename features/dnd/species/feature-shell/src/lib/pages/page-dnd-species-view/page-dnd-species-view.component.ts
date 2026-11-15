import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, Resource } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { pageMeta } from '@ttrpg-ui/shared/core/util';
import { getErrorMessage } from '@ttrpg-ui/shared/store/util';
import { DndSpeciesModels } from '@ttrpg-ui/features/dnd/species/models';

type Species = DndSpeciesModels.Species.SpeciesSchema;

/** `value()` throws while a resource is in error, so read it through this */
const valueOf = <T>(res: Resource<T | undefined>): T | undefined => (res.hasValue() ? res.value() : undefined);

@Component({
  selector: 'lib-page-dnd-species-view',
  imports: [JsonPipe, RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './page-dnd-species-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDndSpeciesViewComponent {
  /** Route resource (`speciesRouteResources`) */
  readonly species = input.required<Resource<Species | undefined>>();

  /** Keeps the last species on screen while the next one loads */
  protected readonly shown = linkedSignal<Species | undefined, Species | undefined>({
    source: () => valueOf(this.species()),
    computation: (value, previous) => value ?? previous?.value,
  });

  protected readonly errorMessage = computed(() => {
    const error = this.species().error();
    if (!error) return null;
    return error instanceof HttpErrorResponse && error.status === 404 ? 'Species not found.' : getErrorMessage(error);
  });

  constructor() {
    pageMeta(() => {
      const species = this.shown();
      // the 2014 and 2024 printings share a name, so the title says which
      return {
        title: [
          species ? `${species.name} (${species.source.name_short} ${species.dnd_version_year})` : 'Species',
          'D&D Species',
        ],
        description: species
          ? `${species.name}, a D&D species from ${species.source.name} (${species.dnd_version_year}).`
          : 'View a D&D species.',
      };
    });
  }
}
