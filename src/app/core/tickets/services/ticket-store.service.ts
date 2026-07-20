import { isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';

import {
  CreateTicketPayload,
  TicketComment,
  TicketRecord,
  TicketStatus,
  TicketUserAction,
} from '../models/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class TicketStoreService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly storageKey =
    'isd-ticket-records';

  private readonly ticketsSignal =
    signal<TicketRecord[]>([]);

  readonly tickets =
    this.ticketsSignal.asReadonly();

  readonly totalTickets = computed(
    () => this.ticketsSignal().length,
  );

  readonly assignedTickets = computed(
    () =>
      this.ticketsSignal().filter(
        ticket => ticket.status === 'Assigned',
      ).length,
  );

  readonly inProgressTickets = computed(
    () =>
      this.ticketsSignal().filter(
        ticket => ticket.status === 'In Progress',
      ).length,
  );

  readonly resolvedTickets = computed(
    () =>
      this.ticketsSignal().filter(
        ticket => ticket.status === 'Resolved',
      ).length,
  );

  readonly closedTickets = computed(
    () =>
      this.ticketsSignal().filter(
        ticket => ticket.status === 'Closed',
      ).length,
  );

  readonly reopenedTickets = computed(
    () =>
      this.ticketsSignal().filter(
        ticket => ticket.status === 'Reopened',
      ).length,
  );

  constructor() {
    this.ticketsSignal.set(
      this.restoreTickets(),
    );
  }

  getTicketById(
    ticketId: string,
  ): TicketRecord | undefined {
    return this.ticketsSignal().find(
      ticket => ticket.ticketId === ticketId,
    );
  }

  getMyRaisedTickets(
    userId: number,
  ): TicketRecord[] {
    return this.ticketsSignal().filter(
      ticket => ticket.createdById === userId,
    );
  }

  getMyActionItems(
    userId: number,
  ): TicketRecord[] {
    return this.ticketsSignal().filter(
      ticket =>
        ticket.assigneeId === userId &&
        ticket.status !== 'Closed',
    );
  }

  getTeamPoolTickets(
    department: string,
  ): TicketRecord[] {
    return this.ticketsSignal().filter(
      ticket =>
        ticket.targetDepartment === department &&
        ticket.assigneeId === null &&
        ticket.status !== 'Closed',
    );
  }

  createTicket(
    payload: CreateTicketPayload,
  ): TicketRecord {
    const createdAt = new Date().toISOString();
    const ticketId = this.generateTicketId();

    const newTicket: TicketRecord = {
      ticketId,
      subject: payload.subject.trim(),
      category: payload.category,
      description: payload.description.trim(),

      priority: payload.priority,
      status: 'Assigned',

      centre: payload.centre,
      originatingDepartment:
        payload.originatingDepartment,
      targetDepartment:
        payload.targetDepartment,

      createdById: payload.createdById,
      createdByName: payload.createdByName,

      assigneeId: null,
      assigneeName: null,
      assigneeCode: null,

      createdAt,
      updatedAt: createdAt,
      resolvedAt: null,

      attachments:
        payload.attachments ?? [],

      comments: [],

      history: [
        {
          id: this.generateRecordId('history'),
          type: 'created',
          title: 'Ticket created',
          description:
            `Ticket created and routed to ${payload.targetDepartment}.`,
          performedById: payload.createdById,
          performedByName:
            payload.createdByName,
          createdAt,
        },
      ],
    };

    this.commit([
      newTicket,
      ...this.ticketsSignal(),
    ]);

    return newTicket;
  }

  assignTicket(
    ticketId: string,
    assignee: TicketUserAction,
    performedBy: TicketUserAction,
  ): boolean {
    const ticket = this.getTicketById(ticketId);

    if (!ticket || ticket.status === 'Closed') {
      return false;
    }

    const updatedAt = new Date().toISOString();

    return this.updateTicket(ticketId, {
      assigneeId: assignee.userId,
      assigneeName: assignee.userName,
      assigneeCode:
        assignee.employeeCode ?? null,
      updatedAt,
      history: [
        {
          id: this.generateRecordId('history'),
          type: 'assigned',
          title: 'Ticket assigned',
          description:
            `Ticket assigned to ${assignee.userName}.`,
          performedById: performedBy.userId,
          performedByName:
            performedBy.userName,
          createdAt: updatedAt,
        },
        ...ticket.history,
      ],
    });
  }

  pickUpTicket(
    ticketId: string,
    user: TicketUserAction,
  ): boolean {
    return this.assignTicket(
      ticketId,
      user,
      user,
    );
  }

  updateStatus(
    ticketId: string,
    nextStatus: TicketStatus,
    performedBy: TicketUserAction,
  ): boolean {
    const ticket = this.getTicketById(ticketId);

    if (!ticket) {
      return false;
    }

    if (
      !this.canTransition(
        ticket.status,
        nextStatus,
      )
    ) {
      return false;
    }

    const updatedAt = new Date().toISOString();

    const statusConfiguration =
      this.getStatusConfiguration(nextStatus);

    return this.updateTicket(ticketId, {
      status: nextStatus,
      updatedAt,
      resolvedAt:
        nextStatus === 'Resolved' ||
        nextStatus === 'Closed'
          ? updatedAt
          : null,
      history: [
        {
          id: this.generateRecordId('history'),
          type: statusConfiguration.type,
          title: statusConfiguration.title,
          description:
            statusConfiguration.description,
          performedById: performedBy.userId,
          performedByName:
            performedBy.userName,
          createdAt: updatedAt,
        },
        ...ticket.history,
      ],
    });
  }

  addComment(
    ticketId: string,
    message: string,
    author: TicketUserAction,
  ): boolean {
    const ticket = this.getTicketById(ticketId);
    const normalizedMessage = message.trim();

    if (
      !ticket ||
      ticket.status === 'Closed' ||
      !normalizedMessage
    ) {
      return false;
    }

    const createdAt = new Date().toISOString();

    const comment: TicketComment = {
      id: this.generateRecordId('comment'),
      authorId: author.userId,
      authorName: author.userName,
      department: author.department,
      message: normalizedMessage,
      createdAt,
    };

    return this.updateTicket(ticketId, {
      comments: [
        comment,
        ...ticket.comments,
      ],
      history: [
        {
          id: this.generateRecordId('history'),
          type: 'comment',
          title: 'Comment added',
          description: normalizedMessage,
          performedById: author.userId,
          performedByName: author.userName,
          createdAt,
        },
        ...ticket.history,
      ],
      updatedAt: createdAt,
    });
  }

  canTransition(
    currentStatus: TicketStatus,
    nextStatus: TicketStatus,
  ): boolean {
    const allowedTransitions: Record<
      TicketStatus,
      TicketStatus[]
    > = {
      Assigned: ['In Progress'],
      'In Progress': ['Resolved'],
      Resolved: ['Closed', 'Reopened'],
      Reopened: ['In Progress'],
      Closed: [],
    };

    return allowedTransitions[
      currentStatus
    ].includes(nextStatus);
  }

  resetDemoTickets(): void {
    this.commit(this.createDemoTickets());
  }

  private updateTicket(
    ticketId: string,
    changes: Partial<TicketRecord>,
  ): boolean {
    let ticketFound = false;

    const updatedTickets =
      this.ticketsSignal().map(ticket => {
        if (ticket.ticketId !== ticketId) {
          return ticket;
        }

        ticketFound = true;

        return {
          ...ticket,
          ...changes,
        };
      });

    if (!ticketFound) {
      return false;
    }

    this.commit(updatedTickets);

    return true;
  }

  private commit(
    tickets: TicketRecord[],
  ): void {
    this.ticketsSignal.set(tickets);

    if (!this.isBrowser()) {
      return;
    }

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(tickets),
    );
  }

  private restoreTickets(): TicketRecord[] {
    if (!this.isBrowser()) {
      return this.createDemoTickets();
    }

    try {
      const storedTickets =
        localStorage.getItem(this.storageKey);

      if (!storedTickets) {
        return this.createDemoTickets();
      }

      const parsedTickets =
        JSON.parse(storedTickets);

      if (!Array.isArray(parsedTickets)) {
        localStorage.removeItem(
          this.storageKey,
        );

        return this.createDemoTickets();
      }

      return parsedTickets as TicketRecord[];
    } catch {
      localStorage.removeItem(
        this.storageKey,
      );

      return this.createDemoTickets();
    }
  }

  private generateTicketId(): string {
    const currentYear =
      new Date().getFullYear();

    const highestTicketNumber =
      this.ticketsSignal().reduce(
        (highestNumber, ticket) => {
          const match = ticket.ticketId.match(
            /^ISD-\d{4}-(\d+)$/,
          );

          if (!match) {
            return highestNumber;
          }

          return Math.max(
            highestNumber,
            Number(match[1]),
          );
        },
        0,
      );

    return `ISD-${currentYear}-${String(
      highestTicketNumber + 1,
    ).padStart(4, '0')}`;
  }

  private generateRecordId(
    prefix: string,
  ): string {
    return `${prefix}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
  }

  private getStatusConfiguration(
    status: TicketStatus,
  ): {
    type:
      | 'progress'
      | 'resolved'
      | 'closed'
      | 'reopened';
    title: string;
    description: string;
  } {
    switch (status) {
      case 'In Progress':
        return {
          type: 'progress',
          title: 'Processing started',
          description:
            'The assigned employee started processing the ticket.',
        };

      case 'Resolved':
        return {
          type: 'resolved',
          title: 'Ticket marked as resolved',
          description:
            'The assigned employee submitted the ticket resolution.',
        };

      case 'Closed':
        return {
          type: 'closed',
          title: 'Ticket closed',
          description:
            'The ticket creator confirmed the resolution.',
        };

      case 'Reopened':
        return {
          type: 'reopened',
          title: 'Ticket reopened',
          description:
            'The submitted resolution was rejected and the ticket was reopened.',
        };

      default:
        throw new Error(
          `Unsupported status transition: ${status}`,
        );
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(
      this.platformId,
    );
  }

  private createDemoTickets(): TicketRecord[] {
    return [
      {
        ticketId: 'ISD-2026-0158',
        subject:
          'Urgent sample pickup delayed',
        category:
          'Sample Collection Delay',
        description:
          'The scheduled sample pickup has not been completed. The samples are packed and ready for collection.',

        priority: 'Critical',
        status: 'In Progress',

        centre:
          'South Satellite Centre',
        originatingDepartment:
          'Customer Relationship Management',
        targetDepartment: 'Logistics',

        createdById: 3,
        createdByName: 'Sourav Dey',

        assigneeId: 2,
        assigneeName: 'Rahul Sharma',
        assigneeCode: 'EMP-0102',

        createdAt:
          '2026-07-18T09:15:00',
        updatedAt:
          '2026-07-18T10:05:00',
        resolvedAt: null,

        attachments: [],
        comments: [],
        history: [
          {
            id: 'history-158-2',
            type: 'progress',
            title: 'Processing started',
            description:
              'Rahul Sharma started processing the ticket.',
            performedById: 2,
            performedByName:
              'Rahul Sharma',
            createdAt:
              '2026-07-18T10:05:00',
          },
          {
            id: 'history-158-1',
            type: 'created',
            title: 'Ticket created',
            description:
              'Ticket created and routed to Logistics.',
            performedById: 3,
            performedByName:
              'Sourav Dey',
            createdAt:
              '2026-07-18T09:15:00',
          },
        ],
      },
      {
        ticketId: 'ISD-2026-0157',
        subject:
          'Invoice total mismatch',
        category: 'Invoice Discrepancy',
        description:
          'The net payable value does not match the approved invoice total.',

        priority: 'High',
        status: 'Assigned',

        centre: 'Corporate Office',
        originatingDepartment:
          'Customer Relationship Management',
        targetDepartment: 'Accounts',

        createdById: 3,
        createdByName: 'Sourav Dey',

        assigneeId: null,
        assigneeName: null,
        assigneeCode: null,

        createdAt:
          '2026-07-18T08:35:00',
        updatedAt:
          '2026-07-18T08:35:00',
        resolvedAt: null,

        attachments: [],
        comments: [],
        history: [
          {
            id: 'history-157-1',
            type: 'created',
            title: 'Ticket created',
            description:
              'Ticket created and routed to Accounts.',
            performedById: 3,
            performedByName:
              'Sourav Dey',
            createdAt:
              '2026-07-18T08:35:00',
          },
        ],
      },
      {
        ticketId: 'ISD-2026-0156',
        subject:
          'Patient report correction required',
        category: 'Report Correction',
        description:
          'A correction is required in the reported patient demographic information.',

        priority: 'Medium',
        status: 'Resolved',

        centre:
          'Main Laboratory - Block A',
        originatingDepartment:
          'Customer Relationship Management',
        targetDepartment: 'Technical',

        createdById: 3,
        createdByName: 'Sourav Dey',

        assigneeId: 4,
        assigneeName: 'Amit Das',
        assigneeCode: 'EMP-0104',

        createdAt:
          '2026-07-17T16:20:00',
        updatedAt:
          '2026-07-18T10:10:00',
        resolvedAt:
          '2026-07-18T10:10:00',

        attachments: [],
        comments: [],
        history: [
          {
            id: 'history-156-2',
            type: 'resolved',
            title:
              'Ticket marked as resolved',
            description:
              'The report correction was completed.',
            performedById: 4,
            performedByName: 'Amit Das',
            createdAt:
              '2026-07-18T10:10:00',
          },
          {
            id: 'history-156-1',
            type: 'created',
            title: 'Ticket created',
            description:
              'Ticket created and routed to Technical.',
            performedById: 3,
            performedByName:
              'Sourav Dey',
            createdAt:
              '2026-07-17T16:20:00',
          },
        ],
      },
      {
        ticketId: 'ISD-2026-0155',
        subject:
          'Reagent stock below minimum level',
        category: 'Reagent Requirement',
        description:
          'The available reagent stock has fallen below the required operating quantity.',

        priority: 'High',
        status: 'Closed',

        centre:
          'Main Laboratory - Block A',
        originatingDepartment:
          'Laboratory',
        targetDepartment: 'Laboratory',

        createdById: 5,
        createdByName: 'Sneha Roy',

        assigneeId: 5,
        assigneeName: 'Sneha Roy',
        assigneeCode: 'EMP-0105',

        createdAt:
          '2026-07-17T14:40:00',
        updatedAt:
          '2026-07-18T09:20:00',
        resolvedAt:
          '2026-07-18T09:20:00',

        attachments: [],
        comments: [],
        history: [
          {
            id: 'history-155-2',
            type: 'closed',
            title: 'Ticket closed',
            description:
              'The reagent requirement was completed and confirmed.',
            performedById: 5,
            performedByName: 'Sneha Roy',
            createdAt:
              '2026-07-18T09:20:00',
          },
          {
            id: 'history-155-1',
            type: 'created',
            title: 'Ticket created',
            description:
              'Ticket created and routed to Laboratory.',
            performedById: 5,
            performedByName: 'Sneha Roy',
            createdAt:
              '2026-07-17T14:40:00',
          },
        ],
      },
      {
        ticketId: 'ISD-2026-0154',
        subject:
          'CRM workflow not loading',
        category:
          'CRM Support Request',
        description:
          'The CRM workflow screen is not loading for the assigned employee.',

        priority: 'Medium',
        status: 'Reopened',

        centre: 'Corporate Office',
        originatingDepartment:
          'Customer Relationship Management',
        targetDepartment:
          'Customer Relationship Management',

        createdById: 3,
        createdByName: 'Sourav Dey',

        assigneeId: 3,
        assigneeName: 'Sourav Dey',
        assigneeCode: 'EMP-0106',

        createdAt:
          '2026-07-17T12:10:00',
        updatedAt:
          '2026-07-18T09:30:00',
        resolvedAt: null,

        attachments: [],
        comments: [],
        history: [
          {
            id: 'history-154-2',
            type: 'reopened',
            title: 'Ticket reopened',
            description:
              'The CRM issue was still occurring after the submitted resolution.',
            performedById: 3,
            performedByName:
              'Sourav Dey',
            createdAt:
              '2026-07-18T09:30:00',
          },
          {
            id: 'history-154-1',
            type: 'created',
            title: 'Ticket created',
            description:
              'Ticket created and routed to Customer Relationship Management.',
            performedById: 3,
            performedByName:
              'Sourav Dey',
            createdAt:
              '2026-07-17T12:10:00',
          },
        ],
      },
      {
        ticketId: 'ISD-2026-0153',
        subject:
          'User unable to access LIMS',
        category:
          'Application Access Issue',
        description:
          'The employee receives an authorization error while opening LIMS.',

        priority: 'High',
        status: 'In Progress',

        centre:
          'Main Laboratory - Block A',
        originatingDepartment:
          'Laboratory',
        targetDepartment:
          'Information Technology',

        createdById: 5,
        createdByName: 'Sneha Roy',

        assigneeId: 1,
        assigneeName: 'Arun Sarkar',
        assigneeCode: 'EMP-0101',

        createdAt:
          '2026-07-17T10:05:00',
        updatedAt:
          '2026-07-17T10:45:00',
        resolvedAt: null,

        attachments: [],
        comments: [],
        history: [
          {
            id: 'history-153-2',
            type: 'progress',
            title: 'Processing started',
            description:
              'The IT team started reviewing the access issue.',
            performedById: 1,
            performedByName:
              'Arun Sarkar',
            createdAt:
              '2026-07-17T10:45:00',
          },
          {
            id: 'history-153-1',
            type: 'created',
            title: 'Ticket created',
            description:
              'Ticket created and routed to Information Technology.',
            performedById: 5,
            performedByName: 'Sneha Roy',
            createdAt:
              '2026-07-17T10:05:00',
          },
        ],
      },
      {
        ticketId: 'ISD-2026-0152',
        subject:
          'Collection executive task missing',
        category:
          'Sample Collection Delay',
        description:
          'The scheduled collection task is not visible to the field executive.',

        priority: 'Critical',
        status: 'Assigned',

        centre:
          'New Town Collection Centre',
        originatingDepartment:
          'Customer Relationship Management',
        targetDepartment: 'Logistics',

        createdById: 3,
        createdByName: 'Sourav Dey',

        assigneeId: null,
        assigneeName: null,
        assigneeCode: null,

        createdAt:
          '2026-07-16T17:30:00',
        updatedAt:
          '2026-07-16T17:30:00',
        resolvedAt: null,

        attachments: [],
        comments: [],
        history: [
          {
            id: 'history-152-1',
            type: 'created',
            title: 'Ticket created',
            description:
              'Ticket created and routed to Logistics.',
            performedById: 3,
            performedByName:
              'Sourav Dey',
            createdAt:
              '2026-07-16T17:30:00',
          },
        ],
      },
    ];
  }
}