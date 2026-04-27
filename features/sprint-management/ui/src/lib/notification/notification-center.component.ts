import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { NotificationStore } from '@ttrpg-ui/features/sprint-management/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { NotificationType } = SprintModels.Notification;
type Notification = SprintModels.Notification.Notification;
type NotificationType = SprintModels.Notification.NotificationType;

/**
 * Notification Center Component
 *
 * Displays a dropdown menu with notification list, badge showing unread count,
 * and actions to mark as read or dismiss notifications.
 *
 */
@Component({
  selector: 'lib-notification-center',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    MatListModule,
  ],
  templateUrl: './notification-center.component.html',
  styleUrl: './notification-center.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationCenterComponent {
  private readonly notificationStore = inject(NotificationStore);
  private readonly router = inject(Router);

  notifications = this.notificationStore.entities;
  unreadCount = this.notificationStore.unreadCount;

  hasNotifications = computed(() => this.notifications().length > 0);

  sortedNotifications = computed(() => {
    const notifications = this.notifications();
    return [...notifications].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  });

  onNotificationClick(notification: Notification): void {
    if (!notification.is_read) {
      this.notificationStore.markAsRead(notification.id);
    }

    this.navigateToEntity(notification);
  }

  private navigateToEntity(notification: Notification): void {
    const { entity_type, entity_id } = notification;

    switch (entity_type) {
      case 'work_item':
        this.router.navigate(['/work-items', entity_id]);
        break;
      case 'sprint':
        this.router.navigate(['/sprints', entity_id]);
        break;
      case 'comment':
      case 'dependency':
        this.router.navigate(['/work-items', entity_id]);
        break;
    }
  }

  onDismissNotification(event: Event, notificationId: string): void {
    event.stopPropagation();
    this.notificationStore.dismissNotification(notificationId);
  }

  onMarkAllAsRead(): void {
    this.notificationStore.markAllAsRead();
  }

  onDismissAll(): void {
    this.notificationStore.dismissAll();
  }

  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.WorkItemAssigned:
        return 'assignment_ind';
      case NotificationType.WorkItemUpdated:
        return 'update';
      case NotificationType.WorkItemCompleted:
        return 'check_circle';
      case NotificationType.CommentAdded:
        return 'comment';
      case NotificationType.DependencyCreated:
        return 'link';
      case NotificationType.SprintStarted:
        return 'play_arrow';
      case NotificationType.SprintCompleted:
        return 'done_all';
      default:
        return 'notifications';
    }
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
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  getNotificationClass(notification: Notification): string {
    return notification.is_read ? 'notification-read' : 'notification-unread';
  }
}
