import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { TicketCategoryApiService } from '../../../masters/services/ticket-category-api.service';
import { TicketApiService } from '../../services/ticket-api.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

type TicketStatus =
  | 'Open'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Reopened';

interface RaisedTicket {
  id: number;
  ticketId: string;
  subject: string;
  category: string;
  targetDepartment: string;
  centre: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string;
  createdAt: string;
}

@Component({
  selector: 'app-my-raised-tickets',
  imports: [FormsModule, RouterLink],
  templateUrl: './my-raised-tickets.html',
  styleUrl: './my-raised-tickets.scss',
})
export class MyRaisedTickets
  implements OnInit {
  private readonly authService =
    inject(AuthService);

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

  readonly statuses: TicketStatus[] = [
    'Open',
    'Assigned',
    'In Progress',
    'Resolved',
    'Closed',
    'Reopened',
  ];

  readonly priorities: TicketPriority[] = [
    'Critical',
    'High',
    'Medium',
    'Low',
  ];


  tickets: RaisedTicket[] = [];

  centres: string[] = [];

  get filteredTickets(): RaisedTicket[] {
    const normalizedSearch = this.searchTerm
      .trim()
      .toLowerCase();

    return this.tickets.filter(ticket => {
      const matchesSearch =
        !normalizedSearch ||
        ticket.ticketId.toLowerCase().includes(normalizedSearch) ||
        ticket.subject.toLowerCase().includes(normalizedSearch) ||
        ticket.category.toLowerCase().includes(normalizedSearch);

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

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading = true;
    this.loadError = '';

    const currentUser =
      this.authService.currentUser();

    if (!currentUser?.id) {
      this.isLoading = false;

      this.loadError =
        'Your login profile is unavailable.';

      return;
    }

    forkJoin({
      tickets:
        this.ticketApiService
          .getAllTickets(),

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
            'Unable to load your tickets.';

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
              !ticket.is_deleted &&
              (
                ticket.requester_id ===
                currentUser.id ||
                ticket.created_by ===
                currentUser.id
              ),
            )
            .map(ticket => ({
              id: ticket.id,

              ticketId:
                ticket.ticket_number,

              subject:
                ticket.subject,

              category:
                ticket.category
                  ?.category_name ??
                'Not available',

              targetDepartment:
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
                this.mapStatus(
                  ticket.status,
                ),

              // The current API response does
              // not contain an assignee object.
              assignee:
                'Not assigned',

              createdAt:
                ticket.created_at,
            }))
            .sort(
              (first, second) =>
                new Date(
                  second.createdAt,
                ).getTime() -
                new Date(
                  first.createdAt,
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
          'Unable to load your tickets.';
      },
    });
  }

  private mapPriority(
    priorityName:
      string | null | undefined,
  ): TicketPriority {
    const allowedPriorities:
      TicketPriority[] = [
        'Critical',
        'High',
        'Medium',
        'Low',
      ];

    return allowedPriorities.includes(
      priorityName as TicketPriority,
    )
      ? priorityName as TicketPriority
      : 'Medium';
  }

  private mapStatus(
    status:
      string | null | undefined,
  ): TicketStatus {
    const normalizedStatus =
      status
        ?.trim()
        .toUpperCase();

    switch (normalizedStatus) {
      case 'OPEN':
        return 'Open';

      case 'ASSIGNED':
        return 'Assigned';

      case 'IN_PROGRESS':
      case 'IN PROGRESS':
        return 'In Progress';

      case 'RESOLVED':
        return 'Resolved';

      case 'CLOSED':
        return 'Closed';

      case 'REOPENED':
        return 'Reopened';

      default:
        return 'Open';
    }
  }
  
  getStatusCount(status: TicketStatus | 'All'): number {
    if (status === 'All') {
      return this.tickets.length;
    }

    return this.tickets.filter(
      ticket => ticket.status === status,
    ).length;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.selectedCentre = '';
  }

  getPriorityClass(priority: TicketPriority): string {
    return `priority-${priority.toLowerCase()}`;
  }


  getStatusClass(status: TicketStatus): string {
  return `status-${status
    .toLowerCase()
    .replaceAll(' ', '-')}`;
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
}