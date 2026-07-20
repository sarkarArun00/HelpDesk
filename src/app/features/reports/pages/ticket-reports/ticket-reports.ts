import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

type TicketStatus =
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
export class TicketReports {
  dateFrom = '';

  dateTo = '';

  selectedDepartment = '';

  selectedCentre = '';

  selectedPriority = '';

  selectedStatus = '';

  exportMessage = '';

  readonly departments = [
    'Information Technology',
    'Logistics',
    'Accounts',
    'Technical',
    'Laboratory',
    'Customer Relationship Management',
  ];

  readonly centres = [
    'Main Laboratory - Block A',
    'South Satellite Centre',
    'Corporate Office',
    'New Town Collection Centre',
    'North Collection Centre',
  ];

  readonly priorities: TicketPriority[] = [
    'Critical',
    'High',
    'Medium',
    'Low',
  ];

  readonly statuses: TicketStatus[] = [
    'Assigned',
    'In Progress',
    'Resolved',
    'Closed',
    'Reopened',
  ];

  readonly tickets: TicketReportRecord[] = [
    {
      id: 1,
      ticketId: 'ISD-2026-0158',
      subject: 'Urgent sample pickup delayed',
      category: 'Sample Collection Delay',
      department: 'Logistics',
      centre: 'South Satellite Centre',
      priority: 'Critical',
      status: 'In Progress',
      assignee: 'Rahul Sharma',
      createdBy: 'Ananya Ghosh',
      createdAt: '2026-07-18T09:15:00',
      resolvedAt: null,
    },
    {
      id: 2,
      ticketId: 'ISD-2026-0157',
      subject: 'Invoice total mismatch',
      category: 'Invoice Discrepancy',
      department: 'Accounts',
      centre: 'Corporate Office',
      priority: 'High',
      status: 'Assigned',
      assignee: 'Priya Sen',
      createdBy: 'Sourav Dey',
      createdAt: '2026-07-18T08:35:00',
      resolvedAt: null,
    },
    {
      id: 3,
      ticketId: 'ISD-2026-0156',
      subject: 'Patient report correction required',
      category: 'Report Correction',
      department: 'Technical',
      centre: 'Main Laboratory - Block A',
      priority: 'Medium',
      status: 'Resolved',
      assignee: 'Amit Das',
      createdBy: 'Puja Singh',
      createdAt: '2026-07-17T16:20:00',
      resolvedAt: '2026-07-18T10:10:00',
    },
    {
      id: 4,
      ticketId: 'ISD-2026-0155',
      subject: 'Reagent stock below minimum level',
      category: 'Reagent Requirement',
      department: 'Laboratory',
      centre: 'Main Laboratory - Block A',
      priority: 'High',
      status: 'Closed',
      assignee: 'Sneha Roy',
      createdBy: 'Riya Das',
      createdAt: '2026-07-17T14:40:00',
      resolvedAt: '2026-07-18T09:20:00',
    },
    {
      id: 5,
      ticketId: 'ISD-2026-0154',
      subject: 'CRM workflow not loading',
      category: 'CRM Support Request',
      department: 'Customer Relationship Management',
      centre: 'Corporate Office',
      priority: 'Medium',
      status: 'Reopened',
      assignee: 'Sourav Dey',
      createdBy: 'Abhishek Roy',
      createdAt: '2026-07-17T12:10:00',
      resolvedAt: null,
    },
    {
      id: 6,
      ticketId: 'ISD-2026-0153',
      subject: 'User unable to access LIMS',
      category: 'Application Access Issue',
      department: 'Information Technology',
      centre: 'Main Laboratory - Block A',
      priority: 'High',
      status: 'In Progress',
      assignee: 'Arun Sarkar',
      createdBy: 'Moumita Sen',
      createdAt: '2026-07-17T10:05:00',
      resolvedAt: null,
    },
    {
      id: 7,
      ticketId: 'ISD-2026-0152',
      subject: 'Collection executive task missing',
      category: 'Sample Collection Delay',
      department: 'Logistics',
      centre: 'New Town Collection Centre',
      priority: 'Critical',
      status: 'Assigned',
      assignee: 'Ankit Kumar',
      createdBy: 'Riya Das',
      createdAt: '2026-07-16T17:30:00',
      resolvedAt: null,
    },
    {
      id: 8,
      ticketId: 'ISD-2026-0151',
      subject: 'Duplicate line item in invoice',
      category: 'Invoice Discrepancy',
      department: 'Accounts',
      centre: 'Corporate Office',
      priority: 'Low',
      status: 'Closed',
      assignee: 'Priya Sen',
      createdBy: 'Sourav Dey',
      createdAt: '2026-07-16T14:20:00',
      resolvedAt: '2026-07-17T11:15:00',
    },
    {
      id: 9,
      ticketId: 'ISD-2026-0150',
      subject: 'Incorrect reference range in report',
      category: 'Report Correction',
      department: 'Technical',
      centre: 'North Collection Centre',
      priority: 'Medium',
      status: 'Resolved',
      assignee: 'Amit Das',
      createdBy: 'Ananya Ghosh',
      createdAt: '2026-07-16T11:45:00',
      resolvedAt: '2026-07-17T09:10:00',
    },
    {
      id: 10,
      ticketId: 'ISD-2026-0149',
      subject: 'Application password reset required',
      category: 'Application Access Issue',
      department: 'Information Technology',
      centre: 'Corporate Office',
      priority: 'Low',
      status: 'Closed',
      assignee: 'Arun Sarkar',
      createdBy: 'Rahul Sharma',
      createdAt: '2026-07-15T16:30:00',
      resolvedAt: '2026-07-15T17:15:00',
    },
    {
      id: 11,
      ticketId: 'ISD-2026-0148',
      subject: 'Sample transport box required',
      category: 'Reagent Requirement',
      department: 'Laboratory',
      centre: 'South Satellite Centre',
      priority: 'High',
      status: 'In Progress',
      assignee: 'Sneha Roy',
      createdBy: 'Puja Singh',
      createdAt: '2026-07-15T13:25:00',
      resolvedAt: null,
    },
    {
      id: 12,
      ticketId: 'ISD-2026-0147',
      subject: 'Customer callback status not updated',
      category: 'CRM Support Request',
      department: 'Customer Relationship Management',
      centre: 'New Town Collection Centre',
      priority: 'Medium',
      status: 'Assigned',
      assignee: 'Sourav Dey',
      createdBy: 'Abhishek Roy',
      createdAt: '2026-07-15T09:50:00',
      resolvedAt: null,
    },
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