import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

type TicketStatus =
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Reopened';

interface TicketAttachment {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface TicketComment {
  id: number;
  author: string;
  department: string;
  message: string;
  createdAt: string;
}

interface TicketHistory {
  id: number;
  title: string;
  description: string;
  performedBy: string;
  createdAt: string;
  type:
    | 'created'
    | 'assigned'
    | 'progress'
    | 'resolved'
    | 'closed'
    | 'reopened'
    | 'comment';
}

interface TicketDetail {
  ticketId: string;
  subject: string;
  category: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: string;
  originatingDepartment: string;
  targetDepartment: string;
  centre: string;
  assignee: string;
  assigneeCode: string;
  createdAt: string;
  updatedAt: string;
  attachments: TicketAttachment[];
  comments: TicketComment[];
  history: TicketHistory[];
}

@Component({
  selector: 'app-ticket-details',
  imports: [FormsModule, RouterLink],
  templateUrl: './ticket-details.html',
  styleUrl: './ticket-details.scss',
})
export class TicketDetails implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly currentUserName = 'Arun Sarkar';

  ticket!: TicketDetail;

  newComment = '';

  actionMessage = '';

  ngOnInit(): void {
    const ticketId =
      this.activatedRoute.snapshot.paramMap.get('ticketId') ??
      'ISD-2026-0128';

    this.ticket = this.createMockTicket(ticketId);
  }

  get canStartProcessing(): boolean {
    return (
      this.ticket.status === 'Assigned' ||
      this.ticket.status === 'Reopened'
    );
  }

  get canResolve(): boolean {
    return this.ticket.status === 'In Progress';
  }

  get canConfirmResolution(): boolean {
    return this.ticket.status === 'Resolved';
  }

  startProcessing(): void {
    this.updateTicketStatus(
      'In Progress',
      'Ticket processing started',
      'The assigned employee started working on the ticket.',
      'progress',
    );
  }

  markResolved(): void {
    this.updateTicketStatus(
      'Resolved',
      'Ticket marked as resolved',
      'The assigned employee submitted the ticket resolution.',
      'resolved',
    );
  }

  closeTicket(): void {
    this.updateTicketStatus(
      'Closed',
      'Resolution confirmed and ticket closed',
      'The ticket creator confirmed the submitted resolution.',
      'closed',
    );
  }

  reopenTicket(): void {
    this.updateTicketStatus(
      'Reopened',
      'Ticket reopened',
      'The ticket creator rejected the resolution and reopened the ticket.',
      'reopened',
    );
  }

  addComment(): void {
    const message = this.newComment.trim();

    if (!message) {
      return;
    }

    const createdAt = new Date().toISOString();

    this.ticket.comments = [
      ...this.ticket.comments,
      {
        id: Date.now(),
        author: this.currentUserName,
        department: 'Information Technology',
        message,
        createdAt,
      },
    ];

    this.ticket.history = [
      {
        id: Date.now() + 1,
        title: 'Comment added',
        description: message,
        performedBy: this.currentUserName,
        createdAt,
        type: 'comment',
      },
      ...this.ticket.history,
    ];

    this.ticket.updatedAt = createdAt;
    this.newComment = '';
    this.actionMessage = 'Your comment has been added successfully.';
  }

  getPriorityClass(priority: TicketPriority): string {
    return `priority-${priority.toLowerCase()}`;
  }

  getStatusClass(status: TicketStatus): string {
    return `status-${status
      .toLowerCase()
      .replaceAll(' ', '-')}`;
  }

  getHistoryIcon(type: TicketHistory['type']): string {
    const icons: Record<TicketHistory['type'], string> = {
      created: 'bi-plus-circle',
      assigned: 'bi-person-check',
      progress: 'bi-play-circle',
      resolved: 'bi-check-circle',
      closed: 'bi-lock',
      reopened: 'bi-arrow-counterclockwise',
      comment: 'bi-chat-left-text',
    };

    return icons[type];
  }

  getInitials(fullName: string): string {
    if (!fullName?.trim()) {
      return '--';
    }

    return fullName
      .trim()
      .split(/\s+/)
      .map(namePart => namePart.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  }

  private updateTicketStatus(
    status: TicketStatus,
    title: string,
    description: string,
    historyType: TicketHistory['type'],
  ): void {
    const updatedAt = new Date().toISOString();

    this.ticket.status = status;
    this.ticket.updatedAt = updatedAt;

    this.ticket.history = [
      {
        id: Date.now(),
        title,
        description,
        performedBy: this.currentUserName,
        createdAt: updatedAt,
        type: historyType,
      },
      ...this.ticket.history,
    ];

    this.actionMessage = `${this.ticket.ticketId} status updated to ${status}.`;
  }

  private createMockTicket(ticketId: string): TicketDetail {
    const statusByTicketId: Record<string, TicketStatus> = {
      'ISD-2026-0128': 'In Progress',
      'ISD-2026-0127': 'Assigned',
      'ISD-2026-0126': 'Resolved',
      'ISD-2026-0125': 'Closed',
      'ISD-2026-0124': 'Reopened',
      'ISD-2026-0142': 'Assigned',
      'ISD-2026-0139': 'In Progress',
      'ISD-2026-0136': 'Reopened',
    };

    const currentStatus =
      statusByTicketId[ticketId] ?? 'Assigned';

    return {
      ticketId,
      subject: 'Urgent sample pickup delayed from collection centre',
      category: 'Sample Collection Delay',
      description:
        'The scheduled sample pickup has not been completed. The collection centre confirmed that the samples are packed and ready, but no field executive has arrived. Please coordinate with the logistics team and arrange immediate pickup.',
      priority: 'Critical',
      status: currentStatus,
      createdBy: 'Arun Sarkar',
      originatingDepartment: 'CRM',
      targetDepartment: 'Logistics',
      centre: 'South Satellite Centre',
      assignee: 'Rahul Sharma',
      assigneeCode: 'EMP-0102',
      createdAt: '2026-07-18T09:15:00',
      updatedAt: '2026-07-18T10:25:00',
      attachments: [
        {
          id: 1,
          name: 'sample-pickup-request.pdf',
          type: 'PDF',
          size: '428 KB',
          uploadedBy: 'Arun Sarkar',
          uploadedAt: '2026-07-18T09:15:00',
        },
        {
          id: 2,
          name: 'packed-sample-box.jpg',
          type: 'JPG',
          size: '1.2 MB',
          uploadedBy: 'Arun Sarkar',
          uploadedAt: '2026-07-18T09:16:00',
        },
      ],
      comments: [
        {
          id: 1,
          author: 'Rahul Sharma',
          department: 'Logistics',
          message:
            'The nearest field executive has been contacted and is travelling to the collection centre.',
          createdAt: '2026-07-18T10:05:00',
        },
        {
          id: 2,
          author: 'Arun Sarkar',
          department: 'CRM',
          message:
            'Please prioritise this pickup because the samples are time-sensitive.',
          createdAt: '2026-07-18T09:35:00',
        },
      ],
      history: [
        {
          id: 1,
          title: 'Processing started',
          description:
            'The assigned employee started processing the ticket.',
          performedBy: 'Rahul Sharma',
          createdAt: '2026-07-18T09:40:00',
          type: 'progress',
        },
        {
          id: 2,
          title: 'Ticket assigned',
          description:
            'Ticket assigned to Rahul Sharma from the Logistics department.',
          performedBy: 'Logistics Supervisor',
          createdAt: '2026-07-18T09:25:00',
          type: 'assigned',
        },
        {
          id: 3,
          title: 'Ticket created',
          description:
            'Ticket created and routed to the Logistics department.',
          performedBy: 'Arun Sarkar',
          createdAt: '2026-07-18T09:15:00',
          type: 'created',
        },
      ],
    };
  }
}