import { Component, computed, input, output, inject } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { DomSanitizer } from '@angular/platform-browser';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type Comment = SprintModels.Comment.Comment;
import { sanitizeMarkdown } from '@ttrpg-ui/features/sprint-management/util';

@Component({
  selector: 'lib-comment-list',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule, MatDividerModule],
  templateUrl: './comment-list.component.html',
  styleUrl: './comment-list.component.scss',
})
export class CommentListComponent {
  private readonly sanitizer = inject(DomSanitizer);

  comments = input.required<Comment[]>();
  currentUserId = input.required<string>();
  loading = input<boolean>(false);

  editComment = output<Comment>();
  deleteComment = output<Comment>();

  sortedComments = computed(() => {
    const comments = this.comments();
    return [...comments].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  });

  sanitizeContent(content: string): string {
    return sanitizeMarkdown(content, this.sanitizer);
  }

  canEdit(comment: Comment): boolean {
    return comment.author_id === this.currentUserId();
  }

  canDelete(comment: Comment): boolean {
    return comment.author_id === this.currentUserId();
  }

  onEditClick(comment: Comment): void {
    this.editComment.emit(comment);
  }

  onDeleteClick(comment: Comment): void {
    this.deleteComment.emit(comment);
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  getAuthorName(comment: Comment): string {
    return `User ${comment.author_id}`;
  }
}
