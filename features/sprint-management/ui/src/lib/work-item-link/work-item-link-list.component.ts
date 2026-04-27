import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type WorkItemLink = SprintModels.WorkItemLink.WorkItemLink;
const { LinkType } = SprintModels.WorkItemLink;

@Component({
  selector: 'lib-work-item-link-list',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './work-item-link-list.component.html',
  styleUrl: './work-item-link-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkItemLinkListComponent {
  links = input<WorkItemLink[]>([]);
  currentWorkItemId = input<string>('');

  linkDeleted = output<string>();

  readonly LinkType = LinkType;

  readonly linkTypeLabels: Record<string, string> = {
    [LinkType.Blocks]: 'Blocks',
    [LinkType.BlockedBy]: 'Blocked By',
    [LinkType.RelatedTo]: 'Related To',
    [LinkType.DuplicateOf]: 'Duplicate Of',
  };

  readonly Object = Object;

  readonly linkTypeIcons: Record<string, string> = {
    [LinkType.Blocks]: 'block',
    [LinkType.BlockedBy]: 'lock',
    [LinkType.RelatedTo]: 'link',
    [LinkType.DuplicateOf]: 'content_copy',
  };

  get groupedLinks(): Record<string, WorkItemLink[]> {
    const groups: Record<string, WorkItemLink[]> = {};
    for (const link of this.links()) {
      if (!groups[link.link_type]) {
        groups[link.link_type] = [];
      }
      groups[link.link_type].push(link);
    }
    return groups;
  }

  getLinkedItemId(link: WorkItemLink): string {
    const currentId = this.currentWorkItemId();
    return link.source_work_item_id === currentId
      ? link.target_work_item_id
      : link.source_work_item_id;
  }

  onDeleteLink(linkId: string): void {
    this.linkDeleted.emit(linkId);
  }
}
