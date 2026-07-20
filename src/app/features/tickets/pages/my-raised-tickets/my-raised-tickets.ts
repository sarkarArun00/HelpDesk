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
export class MyRaisedTickets {
  searchTerm = '';

  selectedStatus = '';

  selectedPriority = '';

  selectedCentre = '';

  readonly statuses: TicketStatus[] = [
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


  readonly tickets: RaisedTicket[] = [
    {
      id: 1,
      ticketId: 'ISD-2026-0128',
      subject: 'Urgent sample pickup delayed',
      category: 'Sample Collection Delay',
      targetDepartment: 'Logistics',
      centre: 'Main Laboratory - Block A',
      priority: 'Critical',
      status: 'In Progress',
      assignee: 'Rahul Sharma',
      createdAt: '2026-07-18T09:30:00',
    },
    {
      id: 2,
      ticketId: 'ISD-2026-0127',
      subject: 'Incorrect amount reflected on invoice',
      category: 'Invoice Discrepancy',
      targetDepartment: 'Accounts',
      centre: 'Corporate Office',
      priority: 'High',
      status: 'Assigned',
      assignee: 'Priya Sen',
      createdAt: '2026-07-17T16:20:00',
    },
    {
      id: 3,
      ticketId: 'ISD-2026-0126',
      subject: 'Patient report requires technical correction',
      category: 'Report Correction',
      targetDepartment: 'Technical',
      centre: 'Main Laboratory - Block A',
      priority: 'Medium',
      status: 'Resolved',
      assignee: 'Amit Das',
      createdAt: '2026-07-17T11:45:00',
    },
    {
      id: 4,
      ticketId: 'ISD-2026-0125',
      subject: 'Additional reagent stock required',
      category: 'Reagent Requirement',
      targetDepartment: 'Laboratory',
      centre: 'South Satellite Centre',
      priority: 'High',
      status: 'Closed',
      assignee: 'Sneha Roy',
      createdAt: '2026-07-16T14:10:00',
    },
    {
      id: 5,
      ticketId: 'ISD-2026-0124',
      subject: 'CRM customer callback workflow issue',
      category: 'CRM Support Request',
      targetDepartment: 'CRM',
      centre: 'Corporate Office',
      priority: 'Medium',
      status: 'Reopened',
      assignee: 'Sourav Dey',
      createdAt: '2026-07-16T10:15:00',
    },
    {
      id: 6,
      ticketId: 'ISD-2026-0123',
      subject: 'Collection executive has not received task',
      category: 'Sample Collection Delay',
      targetDepartment: 'Logistics',
      centre: 'New Town Collection Centre',
      priority: 'Critical',
      status: 'Assigned',
      assignee: 'Ankit Kumar',
      createdAt: '2026-07-15T18:05:00',
    },
    {
      id: 7,
      ticketId: 'ISD-2026-0122',
      subject: 'Final invoice contains duplicate line item',
      category: 'Invoice Discrepancy',
      targetDepartment: 'Accounts',
      centre: 'Corporate Office',
      priority: 'Low',
      status: 'Closed',
      assignee: 'Priya Sen',
      createdAt: '2026-07-15T13:40:00',
    },
  ];

  readonly centres = [
    'Main Laboratory - Block A',
    'South Satellite Centre',
    'Corporate Office',
    'New Town Collection Centre',
  ];

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