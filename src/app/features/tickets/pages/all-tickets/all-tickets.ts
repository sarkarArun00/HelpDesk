import {
  HttpErrorResponse,
} from '@angular/common/http';
import {
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  AuthService,
} from '../../../../core/auth/services/auth.service';

import {
  TicketCategoryApiService,
} from '../../../masters/services/ticket-category-api.service';

import {
  TicketApiService,
} from '../../services/ticket-api.service';

type TicketPriority =
  | 'Critical'
  | 'High'
  | 'Medium'
  | 'Low';

type TicketStatus =
  | 'Open'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Reopened'
  | 'Closed';

interface AllTicketRecord {
  id: number;
  ticketId: string;
  subject: string;
  category: string;
  department: string;
  centre: string;
  priority: TicketPriority;
  status: TicketStatus;
  raisedBy: string;
  assignee: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-all-tickets',
  imports: [
    FormsModule,
    RouterLink,
  ],
  templateUrl: './all-tickets.html',
  styleUrl: './all-tickets.scss',
})
export class AllTickets implements OnInit {
  private readonly authService =
    inject(AuthService);

  private readonly ticketApiService =
    inject(TicketApiService);

  private readonly ticketCategoryApiService =
    inject(TicketCategoryApiService);

  isLoading = false;
  loadError = '';

  searchTerm = '';
  selectedDepartment = '';
  selectedCentre = '';
  selectedPriority = '';
  selectedStatus = '';

  currentPage = 1;
  pageSize = 10;

  tickets: AllTicketRecord[] = [];

  departments: string[] = [];
  centres: string[] = [];

  readonly priorities:
    TicketPriority[] = [
      'Critical',
      'High',
      'Medium',
      'Low',
    ];

  readonly statuses:
    TicketStatus[] = [
      'Open',
      'Assigned',
      'In Progress',
      'Resolved',
      'Reopened',
      'Closed',
    ];

  ngOnInit(): void {
    this.loadTickets();
  }

  get filteredTickets():
    AllTicketRecord[] {
    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    return this.tickets.filter(ticket => {
      const matchesSearch =
        !search ||
        ticket.ticketId
          .toLowerCase()
          .includes(search) ||
        ticket.subject
          .toLowerCase()
          .includes(search) ||
        ticket.category
          .toLowerCase()
          .includes(search) ||
        ticket.raisedBy
          .toLowerCase()
          .includes(search) ||
        ticket.assignee
          .toLowerCase()
          .includes(search);

      const matchesDepartment =
        !this.selectedDepartment ||
        ticket.department ===
        this.selectedDepartment;

      const matchesCentre =
        !this.selectedCentre ||
        ticket.centre ===
        this.selectedCentre;

      const matchesPriority =
        !this.selectedPriority ||
        ticket.priority ===
        this.selectedPriority;

      const matchesStatus =
        !this.selectedStatus ||
        ticket.status ===
        this.selectedStatus;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesCentre &&
        matchesPriority &&
        matchesStatus
      );
    });
  }

  get paginatedTickets():
    AllTicketRecord[] {
    const startIndex =
      (this.currentPage - 1) *
      this.pageSize;

    return this.filteredTickets.slice(
      startIndex,
      startIndex + this.pageSize,
    );
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(
        this.filteredTickets.length /
        this.pageSize,
      ),
    );
  }

  get pageNumbers(): number[] {
    return Array.from(
      {
        length: this.totalPages,
      },
      (_, index) => index + 1,
    );
  }

  get hasActiveFilters(): boolean {
    return Boolean(
      this.searchTerm ||
      this.selectedDepartment ||
      this.selectedCentre ||
      this.selectedPriority ||
      this.selectedStatus,
    );
  }

  loadTickets(): void {
    this.isLoading = true;
    this.loadError = '';

    const storedUser =
      this.authService.currentUser();

    const employeeApiRole:
      'Admin' | 'Manager' =
      storedUser?.role ===
        'Department Manager'
        ? 'Manager'
        : 'Admin';

    forkJoin({
      tickets:
        this.ticketApiService
          .getAllTickets(),

      departments:
        this.ticketCategoryApiService
          .getAllDepartments(),

      employees:
        this.ticketApiService
          .getFilteredEmployeeList({
            status: true,
            // page: 1,
            // limit: 1000,
            role: employeeApiRole,
          }),
    }).subscribe({
      next: response => {
        this.isLoading = false;

        if (
          !response.tickets.success ||
          !response.departments.success ||
          !response.employees.success
        ) {
          this.loadError =
            'Unable to load tickets.';

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

        const employeeNameById =
          new Map<number, string>();

        response.employees.data
          .forEach(employee => {
            employeeNameById.set(
              employee.id,
              employee.employee_name,
            );
          });

        this.tickets =
          response.tickets.data
            .filter(ticket =>
              !ticket.is_deleted,
            )
            .map(ticket => {
              const assignments =
                [
                  ...(ticket.assignments ??
                    []),
                ].sort(
                  (first, second) =>
                    this.getTimestamp(
                      second.assigned_at,
                    ) -
                    this.getTimestamp(
                      first.assigned_at,
                    ),
                );

              const latestAssignment =
                assignments[0] ?? null;

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

                department:
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

                raisedBy:
                  ticket.requester
                    ?.employee_name ??
                  employeeNameById.get(
                    ticket.requester_id,
                  ) ??
                  'Not available',

                assignee:
                  employeeNameById.get(
                    latestAssignment
                      ?.assigned_to ?? 0,
                  ) ??
                  'Not assigned',

                createdAt:
                  ticket.created_at,

                updatedAt:
                  ticket.updated_at,
              };
            })
            .sort(
              (first, second) =>
                this.getTimestamp(
                  second.updatedAt,
                ) -
                this.getTimestamp(
                  first.updatedAt,
                ),
            );

        this.departments = [
          ...new Set(
            this.tickets
              .map(ticket =>
                ticket.department,
              )
              .filter(name =>
                name !== 'Not available',
              ),
          ),
        ].sort();

        this.centres = [
          ...new Set(
            this.tickets
              .map(ticket =>
                ticket.centre,
              )
              .filter(name =>
                name !== 'Not available',
              ),
          ),
        ].sort();

        this.currentPage = 1;
      },

      error: (
        error: HttpErrorResponse,
      ) => {
        this.isLoading = false;

        this.loadError =
          error.error?.message ||
          'Unable to load tickets.';
      },
    });
  }

  get totalTicketCount(): number {
    return this.tickets.length;
  }

  get assignedTicketCount(): number {
    return this.tickets.filter(
      ticket =>
        ticket.status === 'Assigned',
    ).length;
  }

  get inProgressTicketCount(): number {
    return this.tickets.filter(
      ticket =>
        ticket.status === 'In Progress',
    ).length;
  }

  get resolvedClosedTicketCount(): number {
    return this.tickets.filter(
      ticket =>
        ticket.status === 'Resolved' ||
        ticket.status === 'Closed',
    ).length;
  }

  onFiltersChanged(): void {
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedDepartment = '';
    this.selectedCentre = '';
    this.selectedPriority = '';
    this.selectedStatus = '';
    this.currentPage = 1;
  }

  changePage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.currentPage = page;
  }

  getPriorityClass(
    priority: TicketPriority,
  ): string {
    return `priority-${priority.toLowerCase()}`;
  }

  getStatusClass(
    status: TicketStatus,
  ): string {
    return `status-${status
      .toLowerCase()
      .replaceAll(' ', '-')}`;
  }

  formatDate(
    date: string | null | undefined,
  ): string {
    if (!date) {
      return 'Not available';
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime(),
      )
    ) {
      return 'Not available';
    }

    return new Intl.DateTimeFormat(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    ).format(parsedDate);
  }

  private getTimestamp(
    date: string | null | undefined,
  ): number {
    if (!date) {
      return 0;
    }

    const timestamp =
      new Date(date).getTime();

    return Number.isNaN(timestamp)
      ? 0
      : timestamp;
  }

  private mapPriority(
    priority: string | null | undefined,
  ): TicketPriority {
    switch (
    priority
      ?.trim()
      .toUpperCase()
    ) {
      case 'CRITICAL':
        return 'Critical';

      case 'HIGH':
        return 'High';

      case 'LOW':
        return 'Low';

      case 'MEDIUM':
      default:
        return 'Medium';
    }
  }

  private mapStatus(
    status: string | null | undefined,
  ): TicketStatus {
    switch (
    status
      ?.trim()
      .toUpperCase()
    ) {
      case 'OPEN':
        return 'Open';

      case 'IN_PROGRESS':
      case 'IN PROGRESS':
        return 'In Progress';

      case 'RESOLVED':
        return 'Resolved';

      case 'REOPENED':
        return 'Reopened';

      case 'CLOSED':
        return 'Closed';

      case 'ASSIGNED':
      default:
        return 'Assigned';
    }
  }
}