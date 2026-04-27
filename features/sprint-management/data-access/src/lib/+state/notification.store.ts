import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { addEntity, removeEntity, setAllEntities, updateEntity, withEntities } from '@ngrx/signals/entities';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { getBaseStateDefault, setError, setLoaded, setLoading, withComputedBase } = SharedModels.Store;

export const NotificationStore = signalStore(
  { providedIn: 'root' },
  withState(getBaseStateDefault<SprintModels.Notification.Notification>()),
  withEntities<SprintModels.Notification.Notification>(),
  withComputedBase<SprintModels.Notification.Notification>(),
  withComputed((store) => ({
    unreadCount: computed(() => {
      const entities = store.entities();
      return entities.filter((n) => !n.is_read).length;
    }),

    unreadNotifications: computed(() => {
      const entities = store.entities();
      return entities.filter((n) => !n.is_read);
    }),

    readNotifications: computed(() => {
      const entities = store.entities();
      return entities.filter((n) => n.is_read);
    }),
  })),
  withMethods((store) => ({
    addNotification: (notification: SprintModels.Notification.Notification) => {
      patchState(store, addEntity(notification));
    },

    markAsRead: (notificationId: string) => {
      patchState(store, updateEntity({ id: notificationId, changes: { is_read: true } }));
    },

    markAllAsRead: () => {
      const entities = store.entities();
      entities.forEach((notification) => {
        if (!notification.is_read) {
          patchState(store, updateEntity({ id: notification.id, changes: { is_read: true } }));
        }
      });
    },

    dismissNotification: (notificationId: string) => {
      patchState(store, removeEntity(notificationId));
    },

    dismissAll: () => {
      patchState(store, setAllEntities([] as SprintModels.Notification.Notification[]));
    },

    loadNotifications: (notifications: SprintModels.Notification.Notification[]) => {
      // Filter out notifications that are older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentNotifications = notifications.filter((n) => {
        const createdAt = new Date(n.created_at);
        return createdAt >= thirtyDaysAgo;
      });

      patchState(store, setAllEntities(recentNotifications), setLoaded(true), setLoading(false), setError(null, null));
    },

    clearNotifications: () => {
      patchState(store, setAllEntities([] as SprintModels.Notification.Notification[]));
    },
  })),
);
