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
import { DndClassModels } from '@ttrpg-ui/features/dnd/classes/models';

type Class = DndClassModels.Classes.ClassSchema;

/** `value()` throws while a resource is in error, so read it through this */
const valueOf = <T>(res: Resource<T | undefined>): T | undefined => (res.hasValue() ? res.value() : undefined);

@Component({
  selector: 'lib-page-dnd-classes-view',
  imports: [JsonPipe, RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './page-dnd-classes-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDndClassesViewComponent {
  /** Route resource (`classRouteResources`) */
  readonly dndClass = input.required<Resource<Class | undefined>>();

  /** Keeps the last class on screen while the next one loads */
  protected readonly shown = linkedSignal<Class | undefined, Class | undefined>({
    source: () => valueOf(this.dndClass()),
    computation: (value, previous) => value ?? previous?.value,
  });

  protected readonly errorMessage = computed(() => {
    const error = this.dndClass().error();
    if (!error) return null;
    return error instanceof HttpErrorResponse && error.status === 404 ? 'Class not found.' : getErrorMessage(error);
  });

  constructor() {
    pageMeta(() => {
      const dndClass = this.shown();
      // the 2014 and 2024 printings share a name, so the title says which
      return {
        title: [
          dndClass ? `${dndClass.name} (${dndClass.source.name_short} ${dndClass.dnd_version_year})` : 'Class',
          'D&D Classes',
        ],
        description: dndClass
          ? `${dndClass.name}, a D&D class from ${dndClass.source.name} (${dndClass.dnd_version_year}).`
          : 'View a D&D class.',
      };
    });
  }
}
