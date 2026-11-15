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
import { DndSubclassModels } from '@ttrpg-ui/features/dnd/subclasses/models';

type Subclass = DndSubclassModels.Subclasses.SubclassSchema;

/** `value()` throws while a resource is in error, so read it through this */
const valueOf = <T>(res: Resource<T | undefined>): T | undefined => (res.hasValue() ? res.value() : undefined);

@Component({
  selector: 'lib-page-dnd-subclasses-view',
  imports: [JsonPipe, RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './page-dnd-subclasses-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDndSubclassesViewComponent {
  /** Route resource (`subclassRouteResources`) */
  readonly subclass = input.required<Resource<Subclass | undefined>>();

  /** Keeps the last subclass on screen while the next one loads */
  protected readonly shown = linkedSignal<Subclass | undefined, Subclass | undefined>({
    source: () => valueOf(this.subclass()),
    computation: (value, previous) => value ?? previous?.value,
  });

  protected readonly errorMessage = computed(() => {
    const error = this.subclass().error();
    if (!error) return null;
    return error instanceof HttpErrorResponse && error.status === 404 ? 'Subclass not found.' : getErrorMessage(error);
  });

  constructor() {
    pageMeta(() => {
      const subclass = this.shown();
      // the 2014 and 2024 printings share a name, so the title says which
      return {
        title: [
          subclass ? `${subclass.name} (${subclass.source.name_short} ${subclass.dnd_version_year})` : 'Subclass',
          'D&D Subclasses',
        ],
        description: subclass
          ? `${subclass.name}, a D&D subclass from ${subclass.source.name} (${subclass.dnd_version_year}).`
          : 'View a D&D subclass.',
      };
    });
  }
}
