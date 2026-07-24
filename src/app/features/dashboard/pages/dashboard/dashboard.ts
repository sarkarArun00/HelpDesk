import {
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';


import { TicketCategoryApiService } from '../../../masters/services/ticket-category-api.service';
import {
  TicketApiService, TicketListItem, TicketSummaryData,
  TicketSummaryDateFilter,
} from '../../../tickets/services/ticket-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';



// interface DashboardStat {
//   label: string;
//   value: number;
//   description: string;
//   icon: string;
//   type: 'total' | 'assigned' | 'progress' | 'resolved' | 'closed';
// }

interface QueueSummary {
  label: string;
  value: number;
  description: string;
}

interface RecentTicket {
  id: number;
  ticketId: string;
  category: string;
  department: string;
  priority:
  | 'Critical'
  | 'High'
  | 'Medium'
  | 'Low';
  status:
  | 'Open'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Reopened';
  assignee: string;
  updatedAt: string;
}

interface DashboardStat {
  label: string;
  value: number;
  description: string;
  icon: string;
  type:
  | 'total'
  | 'open'
  | 'assigned'
  | 'progress'
  | 'resolved'
  | 'closed';
}

@Component({
  selector: 'app-dashboard',
  imports: [
    MatButtonModule,
    RouterLink,
    FormsModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard
  implements OnInit {
  private readonly ticketApiService =
    inject(TicketApiService);

  private readonly ticketCategoryApiService =
    inject(TicketCategoryApiService);

  isLoadingTickets = false;

  selectedSummaryDateFilter:
    TicketSummaryDateFilter =
    '7-DAYS';
  ticketLoadError = '';

  get statistics(): DashboardStat[] {
    return [
      {
        label:
          'Total Tickets',

        value:
          this.ticketSummary
            .totalTickets,

        description:
          'All tickets available to you',

        icon:
          '▦',

        type:
          'total',
      },
      {
        label:
          'Open',

        value:
          this.ticketSummary
            .openTickets,

        description:
          'Tickets waiting for assignment',

        icon:
          '○',

        type:
          'open',
      },
      {
        label:
          'Assigned',

        value:
          this.ticketSummary
            .assignedTickets,

        description:
          'Tickets assigned for processing',

        icon:
          '✓',

        type:
          'assigned',
      },
      {
        label:
          'In Progress',

        value:
          this.ticketSummary
            .inProgressTickets,

        description:
          'Tickets currently being handled',

        icon:
          '↻',

        type:
          'progress',
      },
      {
        label:
          'Resolved',

        value:
          this.ticketSummary
            .resolvedTickets,

        description:
          'Resolution submitted',

        icon:
          '✓',

        type:
          'resolved',
      },
      {
        label:
          'Closed',

        value:
          this.ticketSummary
            .closedTickets,

        description:
          'Tickets successfully closed',

        icon:
          '⊘',

        type:
          'closed',
      },
    ];
  }

  get queueSummaries():
    QueueSummary[] {
    return [
      {
        label:
          'Assigned to Me',

        value:
          this.ticketSummary
            .assignedToMeTickets,

        description:
          'Tickets currently assigned to you',
      },
      {
        label:
          'Raised by Me',

        value:
          this.ticketSummary
            .raisedByMeTickets,

        description:
          'Tickets raised by you',
      },
      {
        label:
          'Awaiting Confirmation',

        value:
          this.ticketSummary
            .awaitingConfirmationTickets,

        description:
          'Resolved tickets awaiting creator confirmation',
      },
    ];
  }

  readonly summaryDateFilters: {
    label: string;
    value: TicketSummaryDateFilter;
  }[] = [
      {
        label: 'Last 7 Days',
        value: '7-DAYS',
      },
      {
        label: 'Last 15 Days',
        value: '15-DAYS',
      },
      {
        label: 'Last 1 Month',
        value: '1-MONTH',
      },
      {
        label: 'Last 3 Months',
        value: '3-MONTH',
      },
      {
        label: 'Last 6 Months',
        value: '6-MONTH',
      },
      {
        label: 'All Time',
        value: 'ALL',
      },
    ];
  
  ticketSummary:
    TicketSummaryData = {
      totalTickets: 0,
      openTickets: 0,
      assignedTickets: 0,
      inProgressTickets: 0,
      resolvedTickets: 0,
      closedTickets: 0,
      awaitingConfirmationTickets: 0,
      raisedByMeTickets: 0,
      assignedToMeTickets: 0,
    };
  
  isLoadingSummary = false;
  summaryLoadError = '';

  recentTickets: RecentTicket[] = [];

  private readonly activatedRoute =
  inject(ActivatedRoute);

private readonly router = inject(Router);

private readonly destroyRef =
  inject(DestroyRef);

accessDenied = false;

constructor() {
  this.activatedRoute.queryParamMap
    .pipe(
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe(queryParams => {
      this.accessDenied =
        queryParams.get('accessDenied') === 'true';
    });
}

  
  ngOnInit(): void {
    this.loadTicketSummary();
    this.loadDashboardTickets();
  }

  loadDashboardTickets(): void {
    this.isLoadingTickets = true;
    this.ticketLoadError = '';

    forkJoin({
      tickets:
        this.ticketApiService
          .getAllTickets(),

      departments:
        this.ticketCategoryApiService
          .getAllDepartments(),

      employees:
        this.ticketApiService
          .getEmployeeList(),
    }).subscribe({
      next: response => {
        this.isLoadingTickets = false;

        if (
          // !response.created.success ||
          // !response.assigned.success ||
          !response.departments.success ||
          !response.employees.success
        ) {
          this.ticketLoadError =
            'Unable to load dashboard tickets.';

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

        const uniqueTicketMap =
          new Map<number, TicketListItem>();

        response.tickets.data
          .forEach(ticket => {
          if (!ticket.is_deleted) {
            uniqueTicketMap.set(
              ticket.id,
              ticket,
            );
          }
        });

        this.recentTickets = [
          ...uniqueTicketMap.values(),
        ]
          .sort(
            (first, second) =>
              new Date(
                second.updated_at,
              ).getTime() -
              new Date(
                first.updated_at,
              ).getTime(),
          )
          .slice(0, 5)
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

              category:
                ticket.category
                  ?.category_name ??
                'Not available',

              department:
                departmentNameById.get(
                  ticket.department_id,
                ) ??
                `Department ${ticket.department_id}`,

              priority:
                this.mapPriority(
                  ticket.priority
                    ?.priority_name,
                ),

              status:
                this.mapStatus(
                  ticket.status,
                ),

              assignee:
                employeeNameById.get(
                  latestAssignment
                    ?.assigned_to ?? 0,
                ) ??
                'Not assigned',

              updatedAt:
                ticket.updated_at,
            };
          });
      },

      error: (
        error: HttpErrorResponse,
      ) => {
        this.isLoadingTickets = false;

        this.ticketLoadError =
          error.error?.message ||
          'Unable to load dashboard tickets.';
      },
    });
  }

  loadTicketSummary(): void {
    this.isLoadingSummary = true;
    this.summaryLoadError = '';

    this.ticketApiService
      .getTicketSummaryData({
        dateFilter:
          this.selectedSummaryDateFilter,

        department_id:
          null,

        category_id:
          null,

        centre_id:
          null,

        priority_id:
          null,
      })
      .subscribe({
        next: response => {
          this.isLoadingSummary = false;

          if (!response.success) {
            this.summaryLoadError =
              response.message ||
              'Unable to load ticket summary.';

            return;
          }

          this.ticketSummary =
            response.data;
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.isLoadingSummary = false;

          this.summaryLoadError =
            error.error?.message ||
            'Unable to load ticket summary.';
        },
      });
  }

  onSummaryDateFilterChange(): void {
    this.loadTicketSummary();
  }

  private mapPriority(
    priority:
      string | null | undefined,
  ): RecentTicket['priority'] {
    const allowed:
      RecentTicket['priority'][] = [
        'Critical',
        'High',
        'Medium',
        'Low',
      ];

    return allowed.includes(
      priority as RecentTicket['priority'],
    )
      ? priority as RecentTicket['priority']
      : 'Medium';
  }

  private mapStatus(
    status:
      string | null | undefined,
  ): RecentTicket['status'] {
    switch (
    status
      ?.trim()
      .toUpperCase()
    ) {
      case 'OPEN':
        return 'Open';

      case 'ASSIGNED':
      case 'ASSIGN':
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

  dismissAccessDenied(): void {
    this.accessDenied = false;

    void this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        accessDenied: null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  getPriorityClass(priority: RecentTicket['priority']): string {
    return `priority-${priority.toLowerCase()}`;
  }

  getStatusClass(status: RecentTicket['status']): string {
    return `status-${status.toLowerCase().replaceAll(' ', '-')}`;
  }
}