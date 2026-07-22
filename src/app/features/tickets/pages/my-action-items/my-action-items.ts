import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { forkJoin } from 'rxjs';
import { TicketCategoryApiService } from '../../../masters/services/ticket-category-api.service';
import { TicketApiService } from '../../services/ticket-api.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

type ActionTicketStatus =
  | 'Assigned'
  | 'In Progress'
  | 'Reopened';

interface ActionTicket {
  id: number;
  ticketId: string;
  subject: string;
  category: string;
  createdBy: string;
  originatingDepartment: string;
  centre: string;
  priority: TicketPriority;
  status: ActionTicketStatus;
  createdAt: string;
  lastUpdatedAt: string;
}

@Component({
  selector: 'app-my-action-items',
  imports: [FormsModule, RouterLink],
  templateUrl: './my-action-items.html',
  styleUrl: './my-action-items.scss',
})
export class MyActionItems
  implements OnInit {
  private readonly ticketApiService =
    inject(TicketApiService);

  private readonly ticketCategoryApiService =
    inject(TicketCategoryApiService);

  isLoading = false;

  loadError = '';
  searchTerm = '';

  selectedStatus = '';

  selectedPriority = '';

  selectedCentre = '';

  actionMessage = '';

  readonly statuses: ActionTicketStatus[] = [
    'Assigned',
    'In Progress',
    'Reopened',
  ];

  readonly priorities: TicketPriority[] = [
    'Critical',
    'High',
    'Medium',
    'Low',
  ];

  centres: string[] = [];


  tickets: ActionTicket[] = [];

  get filteredTickets(): ActionTicket[] {
    const normalizedSearch = this.searchTerm
      .trim()
      .toLowerCase();

    return this.tickets.filter(ticket => {
      const matchesSearch =
        !normalizedSearch ||
        ticket.ticketId.toLowerCase().includes(normalizedSearch) ||
        ticket.subject.toLowerCase().includes(normalizedSearch) ||
        ticket.category.toLowerCase().includes(normalizedSearch) ||
        ticket.createdBy.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        !this.selectedStatus ||
        ticket.status === this.selectedStatus;

      const matchesPriority =
        !this.selectedPriority ||
        ticket.priority === this.selectedPriority;

      const matchesCentre =
        !this.selectedCentre ||
        ticket.centre === this.selectedCentre;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCentre
      );
    });
  }

  get hasActiveFilters(): boolean {
    return Boolean(
      this.searchTerm ||
        this.selectedStatus ||
        this.selectedPriority ||
        this.selectedCentre,
    );
  }

  get assignedCount(): number {
    return this.tickets.filter(
      ticket => ticket.status === 'Assigned',
    ).length;
  }

  get inProgressCount(): number {
    return this.tickets.filter(
      ticket => ticket.status === 'In Progress',
    ).length;
  }

  get reopenedCount(): number {
    return this.tickets.filter(
      ticket => ticket.status === 'Reopened',
    ).length;
  }

  ngOnInit(): void {
    this.loadAssignedTickets();
  }

  loadAssignedTickets(): void {
    this.isLoading = true;
    this.loadError = '';

    forkJoin({
      tickets:
        this.ticketApiService
          .getAllTickets({
            type: 'assigned',
          }),

      departments:
        this.ticketCategoryApiService
          .getAllDepartments(),
    }).subscribe({
      next: response => {
        this.isLoading = false;

        if (
          !response.tickets.success ||
          !response.departments.success
        ) {
          this.loadError =
            'Unable to load assigned tickets.';

          return;
        }

        const departmentNameById =
          new Map<number, string>();

        response.departments.data
          .forEach(department => {
            departmentNameById.set(
              department.id,
              department.departmentName,
            );
          });

        this.tickets =
          response.tickets.data
            .filter(ticket =>
              !ticket.is_deleted,
            )
            .map(ticket => {
              const assignments =
                ticket.assignments ?? [];

              const latestAssignment =
                assignments.length
                  ? assignments[
                  assignments.length - 1
                  ]
                  : null;

              return {
                id: ticket.id,

                ticketId:
                  ticket.ticket_number,

                subject:
                  ticket.subject,

                category:
                  ticket.category
                    ?.category_name ??
                  'Not available',

                createdBy:
                  ticket.requester
                    ?.employee_name ??
                  'Not available',

                originatingDepartment:
                  departmentNameById.get(
                    ticket.department_id,
                  ) ??
                  `Department ${ticket.department_id}`,

                centre:
                  ticket.centre
                    ?.centreName ??
                  'Not available',

                priority:
                  this.mapPriority(
                    ticket.priority
                      ?.priority_name,
                  ),

                status:
                  this.mapActionStatus(
                    latestAssignment
                      ?.status ??
                    ticket.status,
                  ),

                createdAt:
                  ticket.created_at,

                lastUpdatedAt:
                  latestAssignment
                    ?.updated_at ??
                  ticket.updated_at,
              };
            })
            .sort(
              (first, second) =>
                new Date(
                  second.lastUpdatedAt,
                ).getTime() -
                new Date(
                  first.lastUpdatedAt,
                ).getTime(),
            );

        this.centres = [
          ...new Set(
            this.tickets
              .map(ticket => ticket.centre)
              .filter(
                centre =>
                  centre !==
                  'Not available',
              ),
          ),
        ].sort();
      },

      error: (
        error: HttpErrorResponse,
      ) => {
        this.isLoading = false;

        this.loadError =
          error.error?.message ||
          'Unable to load assigned tickets.';
      },
    });
  }


  private mapPriority(
    priority:
      string | null | undefined,
  ): TicketPriority {
    const allowed:
      TicketPriority[] = [
        'Critical',
        'High',
        'Medium',
        'Low',
      ];

    return allowed.includes(
      priority as TicketPriority,
    )
      ? priority as TicketPriority
      : 'Medium';
  }

  private mapActionStatus(
    status:
      string | null | undefined,
  ): ActionTicketStatus {
    switch (
    status
      ?.trim()
      .toUpperCase()
    ) {
      case 'IN_PROGRESS':
      case 'IN PROGRESS':
        return 'In Progress';

      case 'REOPENED':
        return 'Reopened';

      case 'ASSIGNED':
      default:
        return 'Assigned';
    }
  }
  
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.selectedCentre = '';
  }

  startProcessing(ticketId: number): void {
    this.tickets = this.tickets.map(ticket => {
      if (ticket.id !== ticketId) {
        return ticket;
      }

      return {
        ...ticket,
        status: 'In Progress',
        lastUpdatedAt: new Date().toISOString(),
      };
    });

    this.actionMessage =
      'Ticket status updated to In Progress.';
  }

  markResolved(ticketId: number): void {
    const resolvedTicket = this.tickets.find(
      ticket => ticket.id === ticketId,
    );

    if (!resolvedTicket) {
      return;
    }

    this.tickets = this.tickets.filter(
      ticket => ticket.id !== ticketId,
    );

    this.actionMessage =
      `${resolvedTicket.ticketId} has been marked as resolved and removed from your active action items.`;
  }

  getInitials(fullName: string): string {
    if (!fullName.trim()) {
      return '--';
    }

    return fullName
      .trim()
      .split(/\s+/)
      .map(namePart =>
        namePart.charAt(0).toUpperCase(),
      )
      .join('')
      .slice(0, 2);
  }

  getPriorityClass(priority: TicketPriority): string {
    return `priority-${priority.toLowerCase()}`;
  }

  getStatusClass(status: ActionTicketStatus): string {
    return `status-${status
      .toLowerCase()
      .replaceAll(' ', '-')}`;
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
}