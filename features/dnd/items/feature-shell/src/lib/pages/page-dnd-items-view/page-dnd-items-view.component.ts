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
import { DndItemModels } from '@ttrpg-ui/features/dnd/items/models';

type Item = DndItemModels.Items.ItemSchema;

/** `value()` throws while a resource is in error, so read it through this */
const valueOf = <T>(res: Resource<T | undefined>): T | undefined => (res.hasValue() ? res.value() : undefined);

@Component({
  selector: 'lib-page-dnd-items-view',
  imports: [JsonPipe, RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './page-dnd-items-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDndItemsViewComponent {
  /** Route resource (`itemRouteResources`) */
  readonly item = input.required<Resource<Item | undefined>>();

  /** Keeps the last item on screen while the next one loads */
  protected readonly shown = linkedSignal<Item | undefined, Item | undefined>({
    source: () => valueOf(this.item()),
    computation: (value, previous) => value ?? previous?.value,
  });

  protected readonly errorMessage = computed(() => {
    const error = this.item().error();
    if (!error) return null;
    return error instanceof HttpErrorResponse && error.status === 404 ? 'Item not found.' : getErrorMessage(error);
  });

  constructor() {
    pageMeta(() => {
      const item = this.shown();
      // the 2014 and 2024 printings share a name, so the title says which
      return {
        title: [item ? `${item.name} (${item.source.name_short} ${item.dnd_version_year})` : 'Item', 'D&D Items'],
        description: item
          ? `${item.name}, a D&D item from ${item.source.name} (${item.dnd_version_year}).`
          : 'View a D&D item.',
      };
    });
  }
}
