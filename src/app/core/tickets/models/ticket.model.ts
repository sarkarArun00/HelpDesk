export type TicketPriority =
  | 'Critical'
  | 'High'
  | 'Medium'
  | 'Low';

export type TicketStatus =
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Reopened';

export type TicketHistoryType =
  | 'created'
  | 'assigned'
  | 'progress'
  | 'resolved'
  | 'closed'
  | 'reopened'
  | 'comment';

export interface TicketAttachment {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TicketComment {
  id: string;
  authorId: number;
  authorName: string;
  department: string;
  message: string;
  createdAt: string;
}

export interface TicketHistory {
  id: string;
  type: TicketHistoryType;
  title: string;
  description: string;
  performedById: number;
  performedByName: string;
  createdAt: string;
}

export interface TicketRecord {
  ticketId: string;
  subject: string;
  category: string;
  description: string;

  priority: TicketPriority;
  status: TicketStatus;

  centre: string;
  originatingDepartment: string;
  targetDepartment: string;

  createdById: number;
  createdByName: string;

  assigneeId: number | null;
  assigneeName: string | null;
  assigneeCode: string | null;

  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;

  attachments: TicketAttachment[];
  comments: TicketComment[];
  history: TicketHistory[];
}

export interface CreateTicketPayload {
  subject: string;
  category: string;
  description: string;

  priority: TicketPriority;

  centre: string;
  originatingDepartment: string;
  targetDepartment: string;

  createdById: number;
  createdByName: string;

  attachments?: TicketAttachment[];
}

export interface TicketUserAction {
  userId: number;
  userName: string;
  employeeCode?: string;
  department: string;
}