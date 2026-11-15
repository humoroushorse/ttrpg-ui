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
import { DndBackgroundModels } from '@ttrpg-ui/features/dnd/backgrounds/models';

type Background = DndBackgroundModels.Backgrounds.BackgroundSchema;

/** `value()` throws while a resource is in error, so read it through this */
const valueOf = <T>(res: Resource<T | undefined>): T | undefined => (res.hasValue() ? res.value() : undefined);

@Component({
  selector: 'lib-page-dnd-backgrounds-view',
  imports: [JsonPipe, RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './page-dnd-backgrounds-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDndBackgroundsViewComponent {
  /** Route resource (`backgroundRouteResources`) */
  readonly background = input.required<Resource<Background | undefined>>();

  /** Keeps the last background on screen while the next one loads */
  protected readonly shown = linkedSignal<Background | undefined, Background | undefined>({
    source: () => valueOf(this.background()),
    computation: (value, previous) => value ?? previous?.value,
  });

  protected readonly errorMessage = computed(() => {
    const error = this.background().error();
    if (!error) return null;
    return error instanceof HttpErrorResponse && error.status === 404
      ? 'Background not found.'
      : getErrorMessage(error);
  });

  constructor() {
    pageMeta(() => {
      const background = this.shown();
      // the 2014 and 2024 printings share a name, so the title says which
      return {
        title: [
          background
            ? `${background.name} (${background.source.name_short} ${background.dnd_version_year})`
            : 'Background',
          'D&D Backgrounds',
        ],
        description: background
          ? `${background.name}, a D&D background from ${background.source.name} (${background.dnd_version_year}).`
          : 'View a D&D background.',
      };
    });
  }
}
