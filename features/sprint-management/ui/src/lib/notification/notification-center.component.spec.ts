import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { NotificationCenterComponent } from './notification-center.component';
import { NotificationStore } from '@ttrpg-ui/features/sprint-management/data-access';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { NotificationType } = SprintModels.Notification;
type Notification = SprintModels.Notification.Notification;

describe('NotificationCenterComponent', () => {
  let component: NotificationCenterComponent;
  let fixture: ComponentFixture<NotificationCenterComponent>;
  let mockNotificationStore: any;
  let mockRouter: any;

  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: NotificationType.WorkItemAssigned,
      title: 'Work Item Assigned',
      message: 'You have been assigned to work item #123',
      entity_type: 'work_item',
      entity_id: '123',
      user_id: 'user1',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      type: NotificationType.CommentAdded,
      title: 'New Comment',
      message: 'Someone commented on your work item',
      entity_type: 'work_item',
      entity_id: '456',
      user_id: 'user1',
      is_read: true,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  beforeEach(async () => {
    mockNotificationStore = {
      entities: signal(mockNotifications),
      unreadCount: signal(1),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      dismissNotification: vi.fn(),
      dismissAll: vi.fn(),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [NotificationCenterComponent],
      providers: [
        { provide: NotificationStore, useValue: mockNotificationStore },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display unread count', () => {
    expect(component.unreadCount()).toBe(1);
  });

  it('should have notifications', () => {
    expect(component.hasNotifications()).toBe(true);
    expect(component.notifications().length).toBe(2);
  });

  it('should sort notifications by date (newest first)', () => {
    const sorted = component.sortedNotifications();
    expect(sorted[0].id).toBe('1');
    expect(sorted[1].id).toBe('2');
  });

  it('should mark notification as read when clicked', () => {
    const notification = mockNotifications[0];
    component.onNotificationClick(notification);
    expect(mockNotificationStore.markAsRead).toHaveBeenCalledWith('1');
  });

  it('should navigate to work item when notification is clicked', () => {
    const notification = mockNotifications[0];
    component.onNotificationClick(notification);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/work-items', '123']);
  });

  it('should dismiss notification', () => {
    const event = new Event('click');
    component.onDismissNotification(event, '1');
    expect(mockNotificationStore.dismissNotification).toHaveBeenCalledWith('1');
  });

  it('should mark all as read', () => {
    component.onMarkAllAsRead();
    expect(mockNotificationStore.markAllAsRead).toHaveBeenCalled();
  });

  it('should dismiss all notifications', () => {
    component.onDismissAll();
    expect(mockNotificationStore.dismissAll).toHaveBeenCalled();
  });

  it('should get correct icon for notification type', () => {
    expect(component.getNotificationIcon(NotificationType.WorkItemAssigned)).toBe('assignment_ind');
    expect(component.getNotificationIcon(NotificationType.CommentAdded)).toBe('comment');
    expect(component.getNotificationIcon(NotificationType.WorkItemCompleted)).toBe('check_circle');
  });

  it('should format timestamp correctly', () => {
    const now = new Date();
    const justNow = now.toISOString();
    const oneHourAgo = new Date(now.getTime() - 3600000).toISOString();
    const oneDayAgo = new Date(now.getTime() - 86400000).toISOString();

    expect(component.formatTimestamp(justNow)).toBe('Just now');
    expect(component.formatTimestamp(oneHourAgo)).toBe('1h ago');
    expect(component.formatTimestamp(oneDayAgo)).toBe('1d ago');
  });

  it('should apply correct CSS class based on read status', () => {
    expect(component.getNotificationClass(mockNotifications[0])).toBe('notification-unread');
    expect(component.getNotificationClass(mockNotifications[1])).toBe('notification-read');
  });
});
