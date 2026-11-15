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
import { DndFeatModels } from '@ttrpg-ui/features/dnd/feats/models';

type Feat = DndFeatModels.Feats.FeatSchema;

/** `value()` throws while a resource is in error, so read it through this */
const valueOf = <T>(res: Resource<T | undefined>): T | undefined => (res.hasValue() ? res.value() : undefined);

@Component({
  selector: 'lib-page-dnd-feats-view',
  imports: [JsonPipe, RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './page-dnd-feats-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDndFeatsViewComponent {
  /** Route resource (`featRouteResources`) */
  readonly feat = input.required<Resource<Feat | undefined>>();

  /** Keeps the last feat on screen while the next one loads */
  protected readonly shown = linkedSignal<Feat | undefined, Feat | undefined>({
    source: () => valueOf(this.feat()),
    computation: (value, previous) => value ?? previous?.value,
  });

  protected readonly errorMessage = computed(() => {
    const error = this.feat().error();
    if (!error) return null;
    return error instanceof HttpErrorResponse && error.status === 404 ? 'Feat not found.' : getErrorMessage(error);
  });

  constructor() {
    pageMeta(() => {
      const feat = this.shown();
      // the 2014 and 2024 printings share a name, so the title says which
      return {
        title: [feat ? `${feat.name} (${feat.source.name_short} ${feat.dnd_version_year})` : 'Feat', 'D&D Feats'],
        description: feat
          ? `${feat.name}, a D&D feat from ${feat.source.name} (${feat.dnd_version_year}).`
          : 'View a D&D feat.',
      };
    });
  }
}
