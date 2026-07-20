import { isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';

import { AuthService } from '../../auth/services/auth.service';
import {
  CreateNotificationPayload,
  ServiceDeskNotification,
} from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService);

  private readonly storageKey =
    'isd-service-desk-notifications';

  private readonly notificationsSignal =
    signal<ServiceDeskNotification[]>([]);

  readonly notifications =
    this.notificationsSignal.asReadonly();

  readonly currentUserNotifications = computed(() => {
    const currentUser =
      this.authService.currentUser();

    if (!currentUser) {
      return [];
    }

    return this.notificationsSignal()
      .filter(
        notification =>
          notification.recipientUserId ===
          currentUser.id,
      )
      .sort(
        (firstNotification, secondNotification) =>
          new Date(
            secondNotification.createdAt,
          ).getTime() -
          new Date(
            firstNotification.createdAt,
          ).getTime(),
      );
  });

  readonly unreadCount = computed(
    () =>
      this.currentUserNotifications().filter(
        notification => !notification.isRead,
      ).length,
  );

  constructor() {
    this.notificationsSignal.set(
      this.restoreNotifications(),
    );
  }

  createNotification(
    payload: CreateNotificationPayload,
  ): ServiceDeskNotification {
    const notification: ServiceDeskNotification = {
      id: this.generateNotificationId(),
      recipientUserId:
        payload.recipientUserId,
      type: payload.type,

      title: payload.title.trim(),
      message: payload.message.trim(),

      ticketId:
        payload.ticketId ?? null,
      actorName:
        payload.actorName ?? null,

      isRead: false,
      createdAt: new Date().toISOString(),
    };

    this.commit([
      notification,
      ...this.notificationsSignal(),
    ]);

    return notification;
  }

  markAsRead(notificationId: string): void {
    const updatedNotifications =
      this.notificationsSignal().map(
        notification => {
          if (
            notification.id !==
              notificationId ||
            notification.isRead
          ) {
            return notification;
          }

          return {
            ...notification,
            isRead: true,
          };
        },
      );

    this.commit(updatedNotifications);
  }

  markAllAsRead(): void {
    const currentUser =
      this.authService.currentUser();

    if (!currentUser) {
      return;
    }

    const updatedNotifications =
      this.notificationsSignal().map(
        notification => {
          if (
            notification.recipientUserId !==
              currentUser.id ||
            notification.isRead
          ) {
            return notification;
          }

          return {
            ...notification,
            isRead: true,
          };
        },
      );

    this.commit(updatedNotifications);
  }

  deleteNotification(
    notificationId: string,
  ): void {
    const updatedNotifications =
      this.notificationsSignal().filter(
        notification =>
          notification.id !== notificationId,
      );

    this.commit(updatedNotifications);
  }

  clearReadNotifications(): void {
    const currentUser =
      this.authService.currentUser();

    if (!currentUser) {
      return;
    }

    const updatedNotifications =
      this.notificationsSignal().filter(
        notification =>
          notification.recipientUserId !==
            currentUser.id ||
          !notification.isRead,
      );

    this.commit(updatedNotifications);
  }

  private commit(
    notifications: ServiceDeskNotification[],
  ): void {
    this.notificationsSignal.set(
      notifications,
    );

    if (!this.isBrowser()) {
      return;
    }

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(notifications),
    );
  }

  private restoreNotifications():
    ServiceDeskNotification[] {
    if (!this.isBrowser()) {
      return this.createDemoNotifications();
    }

    try {
      const storedNotifications =
        localStorage.getItem(this.storageKey);

      if (!storedNotifications) {
        const demoNotifications =
          this.createDemoNotifications();

        localStorage.setItem(
          this.storageKey,
          JSON.stringify(demoNotifications),
        );

        return demoNotifications;
      }

      const parsedNotifications =
        JSON.parse(storedNotifications);

      if (!Array.isArray(parsedNotifications)) {
        localStorage.removeItem(
          this.storageKey,
        );

        return this.createDemoNotifications();
      }

      return parsedNotifications as
        ServiceDeskNotification[];
    } catch {
      localStorage.removeItem(
        this.storageKey,
      );

      return this.createDemoNotifications();
    }
  }

  private generateNotificationId(): string {
    return `notification-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(
      this.platformId,
    );
  }

  private createDemoNotifications():
    ServiceDeskNotification[] {
    return [
      {
        id: 'notification-employee-1',
        recipientUserId: 3,
        type: 'status-changed',
        title: 'Ticket processing started',
        message:
          'Rahul Sharma started processing your sample pickup ticket.',
        ticketId: 'ISD-2026-0158',
        actorName: 'Rahul Sharma',
        isRead: false,
        createdAt:
          '2026-07-18T10:05:00',
      },
      {
        id: 'notification-employee-2',
        recipientUserId: 3,
        type: 'ticket-assigned',
        title: 'Ticket assigned',
        message:
          'Your report correction ticket has been assigned to Amit Das.',
        ticketId: 'ISD-2026-0156',
        actorName: 'Amit Das',
        isRead: false,
        createdAt:
          '2026-07-18T09:45:00',
      },
      {
        id: 'notification-employee-3',
        recipientUserId: 3,
        type: 'status-changed',
        title: 'Resolution submitted',
        message:
          'A resolution has been submitted for your report correction ticket.',
        ticketId: 'ISD-2026-0156',
        actorName: 'Amit Das',
        isRead: true,
        createdAt:
          '2026-07-18T09:30:00',
      },
      {
        id: 'notification-manager-1',
        recipientUserId: 2,
        type: 'ticket-created',
        title: 'New Logistics ticket',
        message:
          'A critical sample collection ticket has been added to the Logistics team pool.',
        ticketId: 'ISD-2026-0152',
        actorName: 'Sourav Dey',
        isRead: false,
        createdAt:
          '2026-07-18T09:20:00',
      },
      {
        id: 'notification-manager-2',
        recipientUserId: 2,
        type: 'comment',
        title: 'New ticket comment',
        message:
          'A new comment was added to the sample pickup ticket.',
        ticketId: 'ISD-2026-0158',
        actorName: 'Sourav Dey',
        isRead: false,
        createdAt:
          '2026-07-18T08:50:00',
      },
      {
        id: 'notification-admin-1',
        recipientUserId: 1,
        type: 'ticket-assigned',
        title: 'Ticket assigned to you',
        message:
          'The LIMS application access ticket has been assigned to you.',
        ticketId: 'ISD-2026-0153',
        actorName: 'System Admin',
        isRead: false,
        createdAt:
          '2026-07-17T10:30:00',
      },
      {
        id: 'notification-admin-2',
        recipientUserId: 1,
        type: 'system',
        title: 'Service Desk update',
        message:
          'The Internal Service Desk notification module is active.',
        ticketId: null,
        actorName: null,
        isRead: true,
        createdAt:
          '2026-07-17T09:00:00',
      },
    ];
  }
}