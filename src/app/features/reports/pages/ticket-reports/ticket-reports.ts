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
  TicketCategoryApiService,
} from '../../../masters/services/ticket-category-api.service';

import {
  TicketApiService,
} from '../../../tickets/services/ticket-api.service';

type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

type TicketStatus =
  | 'Open'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Reopened';

interface TicketReportRecord {
  id: number;
  ticketId: string;
  subject: string;
  category: string;
  department: string;
  centre: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string;
  createdBy: string;
  createdAt: string;
  resolvedAt: string | null;
}

interface ReportSummaryItem {
  label: string;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-ticket-reports',
  imports: [FormsModule, RouterLink],
  templateUrl: './ticket-reports.html',
  styleUrl: './ticket-reports.scss',
})
export class TicketReports implements OnInit {
  private readonly ticketApiService =
    inject(TicketApiService);

  private readonly ticketCategoryApiService =
    inject(TicketCategoryApiService);

  isLoading = false;
  loadError = '';
  departments: string[] = [];

  centres: string[] = [];

  tickets: TicketReportRecord[] = [];
  dateFrom = '';

  dateTo = '';

  selectedDepartment = '';

  selectedCentre = '';

  selectedPriority = '';

  selectedStatus = '';

  exportMessage = '';


  readonly priorities: TicketPriority[] = [
    'Critical',
    'High',
    'Medium',
    'Low',
  ];

  readonly statuses: TicketStatus[] = [
    'Open',
    'Assigned',
    'In Progress',
    'Resolved',
    'Closed',
    'Reopened',
  ];



  get filteredTickets(): TicketReportRecord[] {
    if (this.isDateRangeInvalid) {
      return [];
    }

    const fromDate = this.dateFrom
      ? new Date(`${this.dateFrom}T00:00:00`).getTime()
      : null;

    const toDate = this.dateTo
      ? new Date(`${this.dateTo}T23:59:59.999`).getTime()
      : null;

    return this.tickets.filter(ticket => {
      const createdAt = new Date(ticket.createdAt).getTime();

      const matchesFromDate =
        fromDate === null || createdAt >= fromDate;

      const matchesToDate =
        toDate === null || createdAt <= toDate;

      const matchesDepartment =
        !this.selectedDepartment ||
        ticket.department === this.selectedDepartment;

      const matchesCentre =
        !this.selectedCentre ||
        ticket.centre === this.selectedCentre;

      const matchesPriority =
        !this.selectedPriority ||
        ticket.priority === this.selectedPriority;

      const matchesStatus =
        !this.selectedStatus ||
        ticket.status === this.selectedStatus;

      return (
        matchesFromDate &&
        matchesToDate &&
        matchesDepartment &&
        matchesCentre &&
        matchesPriority &&
        matchesStatus
      );
    });
  }

  get isDateRangeInvalid(): boolean {
    if (!this.dateFrom || !this.dateTo) {
      return false;
    }

    return new Date(this.dateFrom) > new Date(this.dateTo);
  }

  get hasActiveFilters(): boolean {
    return Boolean(
      this.dateFrom ||
        this.dateTo ||
        this.selectedDepartment ||
        this.selectedCentre ||
        this.selectedPriority ||
        this.selectedStatus,
    );
  }

  get assignedCount(): number {
    return this.getStatusCount('Assigned');
  }

  get inProgressCount(): number {
    return this.getStatusCount('In Progress');
  }

  get resolvedCount(): number {
    return this.getStatusCount('Resolved');
  }

  get closedCount(): number {
    return this.getStatusCount('Closed');
  }

  get reopenedCount(): number {
    return this.getStatusCount('Reopened');
  }

  get departmentSummary(): ReportSummaryItem[] {
    return this.buildSummary(
      this.filteredTickets.map(ticket => ticket.department),
    );
  }

  get categorySummary(): ReportSummaryItem[] {
    return this.buildSummary(
      this.filteredTickets.map(ticket => ticket.category),
    );
  }

  get centreSummary(): ReportSummaryItem[] {
    return this.buildSummary(
      this.filteredTickets.map(ticket => ticket.centre),
    );
  }

  get assigneeSummary(): ReportSummaryItem[] {
    return this.buildSummary(
      this.filteredTickets.map(ticket => ticket.assignee),
    );
  }

  get prioritySummary(): ReportSummaryItem[] {
    return this.priorities.map(priority => {
      const count = this.filteredTickets.filter(
        ticket => ticket.priority === priority,
      ).length;

      return {
        label: priority,
        count,
        percentage: this.calculatePercentage(count),
      };
    });
  }

  get statusSummary(): ReportSummaryItem[] {
    return this.statuses.map(status => {
      const count = this.filteredTickets.filter(
        ticket => ticket.status === status,
      ).length;

      return {
        label: status,
        count,
        percentage: this.calculatePercentage(count),
      };
    });
  }


  ngOnInit(): void {
    this.loadReportTickets();
  }

  loadReportTickets(): void {
    this.isLoading = true;
    this.loadError = '';

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
        this.isLoading = false;

        if (
          !response.tickets.success ||
          !response.departments.success ||
          !response.employees.success
        ) {
          this.loadError =
            'Unable to load ticket report.';

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

        this.tickets = response.tickets.data
          .filter(ticket => !ticket.is_deleted)
          .map(ticket => {
            const assignments =
              [...(ticket.assignments ?? [])]
                .sort(
                  (first, second) =>
                    new Date(
                      second.assigned_at,
                    ).getTime() -
                    new Date(
                      first.assigned_at,
                    ).getTime(),
                );

            const latestAssignment =
              assignments[0] ?? null;

            const status =
              this.mapTicketStatus(
                ticket.status,
              );

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
                this.mapTicketPriority(
                  ticket.priority
                    ?.priority_name,
                ),

              status,

              assignee:
                employeeNameById.get(
                  latestAssignment
                    ?.assigned_to ?? 0,
                ) ??
                'Not assigned',

              createdBy:
                ticket.requester
                  ?.employee_name ??
                employeeNameById.get(
                  ticket.requester_id,
                ) ??
                'Not available',

              createdAt:
                ticket.created_at,

              resolvedAt:
                status === 'Resolved' ||
                  status === 'Closed'
                  ? ticket.updated_at
                  : null,
            };
          })
          .sort(
            (first, second) =>
              new Date(
                second.createdAt,
              ).getTime() -
              new Date(
                first.createdAt,
              ).getTime(),
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
      },

      error: (
        error: HttpErrorResponse,
      ) => {
        this.isLoading = false;

        this.loadError =
          error.error?.message ||
          'Unable to load ticket report.';
      },
    });
  }

  private mapTicketPriority(
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

  private mapTicketStatus(
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

      case 'CLOSED':
        return 'Closed';

      case 'REOPENED':
        return 'Reopened';

      case 'ASSIGNED':
      default:
        return 'Assigned';
    }
  }
  
  resetFilters(): void {
    this.dateFrom = '';
    this.dateTo = '';
    this.selectedDepartment = '';
    this.selectedCentre = '';
    this.selectedPriority = '';
    this.selectedStatus = '';
    this.exportMessage = '';
  }

  exportCsv(): void {
    this.exportMessage = '';

    if (this.isDateRangeInvalid) {
      this.exportMessage =
        'Correct the date range before exporting the report.';
      return;
    }

    if (!this.filteredTickets.length) {
      this.exportMessage =
        'There are no ticket records available to export.';
      return;
    }

    const headers = [
      'Ticket ID',
      'Subject',
      'Category',
      'Department',
      'Centre',
      'Priority',
      'Status',
      'Assignee',
      'Created By',
      'Created At',
      'Resolved At',
    ];

    const rows = this.filteredTickets.map(ticket => [
      ticket.ticketId,
      ticket.subject,
      ticket.category,
      ticket.department,
      ticket.centre,
      ticket.priority,
      ticket.status,
      ticket.assignee,
      ticket.createdBy,
      this.formatDate(ticket.createdAt),
      ticket.resolvedAt
        ? this.formatDate(ticket.resolvedAt)
        : '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row =>
        row
          .map(value => this.escapeCsvValue(String(value)))
          .join(','),
      )
      .join('\n');

    const csvBlob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const downloadUrl = URL.createObjectURL(csvBlob);
    const downloadLink = document.createElement('a');

    downloadLink.href = downloadUrl;
    downloadLink.download =
      `isd-ticket-report-${this.getCurrentDate()}.csv`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    URL.revokeObjectURL(downloadUrl);

    this.exportMessage =
      `${this.filteredTickets.length} ticket records exported successfully.`;
  }

  getPriorityClass(priority: TicketPriority): string {
    return `priority-${priority.toLowerCase()}`;
  }

  getStatusClass(status: TicketStatus): string {
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

  private getStatusCount(status: TicketStatus): number {
    return this.filteredTickets.filter(
      ticket => ticket.status === status,
    ).length;
  }

  private buildSummary(values: string[]): ReportSummaryItem[] {
    const countMap = new Map<string, number>();

    values.forEach(value => {
      countMap.set(value, (countMap.get(value) ?? 0) + 1);
    });

    return Array.from(countMap.entries())
      .map(([label, count]) => ({
        label,
        count,
        percentage: this.calculatePercentage(count),
      }))
      .sort(
        (firstItem, secondItem) =>
          secondItem.count - firstItem.count,
      );
  }

  private calculatePercentage(count: number): number {
    if (!this.filteredTickets.length) {
      return 0;
    }

    return Math.round(
      (count / this.filteredTickets.length) * 100,
    );
  }

  private escapeCsvValue(value: string): string {
    return `"${value.replaceAll('"', '""')}"`;
  }

  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}