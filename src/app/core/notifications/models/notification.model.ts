export type NotificationType =
  | 'ticket-created'
  | 'ticket-assigned'
  | 'status-changed'
  | 'comment'
  | 'system';

export interface ServiceDeskNotification {
  id: string;
  recipientUserId: number;
  type: NotificationType;

  title: string;
  message: string;

  ticketId: string | null;
  actorName: string | null;

  isRead: boolean;
  createdAt: string;
}

export interface CreateNotificationPayload {
  recipientUserId: number;
  type: NotificationType;

  title: string;
  message: string;

  ticketId?: string | null;
  actorName?: string | null;
}