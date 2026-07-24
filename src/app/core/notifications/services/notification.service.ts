import { isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  Observable,
} from 'rxjs';

import {
  environment,
} from '../../../../environments/environment';

import { AuthService } from '../../auth/services/auth.service';
import {
  CreateNotificationPayload,
  ServiceDeskNotification,
} from '../models/notification.model';





export interface NotificationApiItem {
  id: number;
  userId: number;
  senderId: number | null;
  ticketId: number | null;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationListResponse {
  success: boolean;
  message: string;
  unreadCount: number;
  total: number;
  data: NotificationApiItem[];
  pagination: NotificationPagination;
}

export interface NotificationUnreadCountResponse {
  success: boolean;
  message: string;
  unreadCount: number;
}

export interface NotificationActionResponse {
  success: boolean;
  message: string;
}

export type NotificationApiType =
  | 'STATUS_CHANGE'
  | 'TICKET_CREATED'
  | 'TICKET_ASSIGNED'
  | 'COMMENT'
  | 'SYSTEM';

export interface NotificationListPayload {
  isRead?: boolean;
  type?: NotificationApiType;
  page: number;
  limit: number;
}




@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService);

  private readonly http =
    inject(HttpClient);

  private readonly apiBaseUrl =
    environment.apiBaseUrl;
  
  private readonly unreadCountSignal =
    signal(0);

  private readonly loadingSignal =
    signal(false);

  private readonly loadErrorSignal =
    signal('');

  readonly isLoading =
    this.loadingSignal.asReadonly();

  readonly loadError =
    this.loadErrorSignal.asReadonly();
  
  private readonly paginationSignal =
    signal<NotificationPagination>({
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

  private readonly loadingMoreSignal =
    signal(false);

  private activeIsRead:
    boolean | undefined;

  private activeType:
    NotificationApiType | undefined;

  readonly pagination =
    this.paginationSignal.asReadonly();

  readonly isLoadingMore =
    this.loadingMoreSignal.asReadonly();

  readonly hasMoreNotifications =
    computed(() => {
      const pagination =
        this.paginationSignal();

      return (
        pagination.page <
        pagination.totalPages
      );
    });
  

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

  readonly unreadCount =
    this.unreadCountSignal.asReadonly();

  constructor() {
    this.notificationsSignal.set([]);
  }

  
  loadNotifications(
    page = 1,
    limit = 10,
    isRead?: boolean,
    type?: NotificationApiType,
    append = false,
  ): void {
    if (append) {
      this.loadingMoreSignal.set(true);
    } else {
      this.loadingSignal.set(true);
      this.loadErrorSignal.set('');

      this.activeIsRead =
        isRead;

      this.activeType =
        type;
    }

    this.getNotificationList({
      page,
      limit,
      ...(isRead !== undefined
        ? {
          isRead,
        }
        : {}),
      ...(type
        ? {
          type,
        }
        : {}),
    }).subscribe({
      next: response => {
        this.loadingSignal.set(false);
        this.loadingMoreSignal.set(false);

        if (!response.success) {
          this.loadErrorSignal.set(
            response.message ||
            'Unable to load notifications.',
          );

          return;
        }

        const notifications =
          response.data.map(item => ({
            id:
              String(item.id),

            recipientUserId:
              item.userId,

            type:
              this.mapNotificationType(
                item.type,
              ),

            title:
              item.title,

            message:
              item.message,

            ticketId:
              item.ticketId !== null
                ? String(item.ticketId)
                : null,

            actorName:
              item.senderId !== null
                ? `User ${item.senderId}`
                : null,

            isRead:
              item.isRead,

            createdAt:
              item.createdAt,
          }));

        if (append) {
          this.notificationsSignal.update(
            currentNotifications => {
              const notificationMap =
                new Map<
                  string,
                  ServiceDeskNotification
                >();

              [
                ...currentNotifications,
                ...notifications,
              ].forEach(notification => {
                notificationMap.set(
                  notification.id,
                  notification,
                );
              });

              return [
                ...notificationMap.values(),
              ];
            },
          );
        } else {
          this.notificationsSignal.set(
            notifications,
          );
        }

        this.paginationSignal.set(
          response.pagination,
        );

        this.unreadCountSignal.set(
          response.unreadCount,
        );
      },

      error: error => {
        this.loadingSignal.set(false);
        this.loadingMoreSignal.set(false);

        this.loadErrorSignal.set(
          error.error?.message ||
          'Unable to load notifications.',
        );
      },
    });
  }

  loadMoreNotifications(): void {
    const pagination =
      this.paginationSignal();

    if (
      this.loadingSignal() ||
      this.loadingMoreSignal() ||
      pagination.page >=
      pagination.totalPages
    ) {
      return;
    }

    this.loadNotifications(
      pagination.page + 1,
      pagination.limit,
      this.activeIsRead,
      this.activeType,
      true,
    );
  }

  private mapNotificationType(
    type: string,
  ): ServiceDeskNotification['type'] {
    switch (
    type
      ?.trim()
      .toUpperCase()
    ) {
      case 'TICKET_CREATED':
      case 'CREATE':
        return 'ticket-created';

      case 'TICKET_ASSIGNED':
      case 'ASSIGNED':
      case 'ASSIGNMENT':
        return 'ticket-assigned';

      case 'STATUS_CHANGE':
      case 'STATUS_CHANGED':
        return 'status-changed';

      case 'COMMENT':
      case 'COMMENT_ADDED':
        return 'comment';

      case 'SYSTEM':
      default:
        return 'system';
    }
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

  markAsRead(
    notificationId: string,
  ): void {
    const numericId =
      Number(notificationId);

    if (
      !numericId ||
      Number.isNaN(numericId)
    ) {
      return;
    }

    const selectedNotification =
      this.notificationsSignal()
        .find(notification =>
          notification.id ===
          notificationId,
        );

    if (
      !selectedNotification ||
      selectedNotification.isRead
    ) {
      return;
    }

    this.markNotificationRead(
      numericId,
    ).subscribe({
      next: response => {
        if (!response.success) {
          return;
        }

        this.notificationsSignal.update(
          notifications =>
            notifications.map(
              notification =>
                notification.id ===
                  notificationId
                  ? {
                    ...notification,
                    isRead: true,
                  }
                  : notification,
            ),
        );

        this.unreadCountSignal.update(
          count =>
            Math.max(
              0,
              count - 1,
            ),
        );
      },

      error: error => {
        console.error(
          'Unable to mark notification as read:',
          error,
        );
      },
    });
  }

  markAllAsRead(): void {
    if (
      this.unreadCountSignal() === 0
    ) {
      return;
    }

    this.markAllNotificationsRead()
      .subscribe({
        next: response => {
          if (!response.success) {
            return;
          }

          this.notificationsSignal.update(
            notifications =>
              notifications.map(
                notification => ({
                  ...notification,
                  isRead: true,
                }),
              ),
          );

          this.unreadCountSignal.set(0);
        },

        error: error => {
          console.error(
            'Unable to mark all notifications as read:',
            error,
          );
        },
      });
  }

  deleteNotification(
    notificationId: string,
  ): void {
    const numericId =
      Number(notificationId);

    if (
      !numericId ||
      Number.isNaN(numericId)
    ) {
      return;
    }

    const selectedNotification =
      this.notificationsSignal()
        .find(notification =>
          notification.id ===
          notificationId,
        );

    if (!selectedNotification) {
      return;
    }

    this.deleteNotificationFromApi(
      numericId,
    ).subscribe({
      next: response => {
        if (!response.success) {
          return;
        }

        this.notificationsSignal.update(
          notifications =>
            notifications.filter(
              notification =>
                notification.id !==
                notificationId,
            ),
        );

        if (
          !selectedNotification.isRead
        ) {
          this.unreadCountSignal.update(
            count =>
              Math.max(
                0,
                count - 1,
              ),
          );
        }
      },

      error: error => {
        console.error(
          'Unable to delete notification:',
          error,
        );
      },
    });
  }

  refreshUnreadCount(): void {
    this.getUnreadNotificationCount()
      .subscribe({
        next: response => {
          if (!response.success) {
            return;
          }

          this.unreadCountSignal.set(
            response.unreadCount,
          );
        },

        error: error => {
          console.error(
            'Unable to refresh unread notification count:',
            error,
          );
        },
      });
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
        actorName: 'Admin',
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


  getNotificationList(
    payload: NotificationListPayload,
  ): Observable<NotificationListResponse> {
    return this.http.post<NotificationListResponse>(
      `${this.apiBaseUrl}/notification/list`,
      payload,
    );
  }

  getUnreadNotificationCount():
    Observable<NotificationUnreadCountResponse> {
    return this.http.get<NotificationUnreadCountResponse>(
      `${this.apiBaseUrl}/notification/unread-count`,
    );
  }

  markNotificationRead(
    notificationId: number,
  ): Observable<NotificationActionResponse> {
    return this.http.post<NotificationActionResponse>(
      `${this.apiBaseUrl}/notification/mark-read`,
      {
        id: notificationId,
      },
    );
  }

  markAllNotificationsRead():
    Observable<NotificationActionResponse> {
    return this.http.post<NotificationActionResponse>(
      `${this.apiBaseUrl}/notification/mark-all-read`,
      {},
    );
  }

  deleteNotificationFromApi(
    notificationId: number,
  ): Observable<NotificationActionResponse> {
    return this.http.post<NotificationActionResponse>(
      `${this.apiBaseUrl}/notification/delete`,
      {
        id: notificationId,
      },
    );
  }
}