import { Component } from '@angular/core';
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
export class MyActionItems {
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

  readonly centres = [
    'Main Laboratory - Block A',
    'South Satellite Centre',
    'Corporate Office',
    'New Town Collection Centre',
  ];

  tickets: ActionTicket[] = [
    {
      id: 1,
      ticketId: 'ISD-2026-0142',
      subject: 'Urgent home collection pickup has been delayed',
      category: 'Sample Collection Delay',
      createdBy: 'Ananya Ghosh',
      originatingDepartment: 'CRM',
      centre: 'Main Laboratory - Block A',
      priority: 'Critical',
      status: 'Assigned',
      createdAt: '2026-07-18T09:15:00',
      lastUpdatedAt: '2026-07-18T09:25:00',
    },
    {
      id: 2,
      ticketId: 'ISD-2026-0139',
      subject: 'Invoice total does not match approved quotation',
      category: 'Invoice Discrepancy',
      createdBy: 'Sourav Dey',
      originatingDepartment: 'Operations',
      centre: 'Corporate Office',
      priority: 'High',
      status: 'In Progress',
      createdAt: '2026-07-17T16:30:00',
      lastUpdatedAt: '2026-07-18T08:40:00',
    },
    {
      id: 3,
      ticketId: 'ISD-2026-0136',
      subject: 'Corrected report has not been published',
      category: 'Report Correction',
      createdBy: 'Puja Singh',
      originatingDepartment: 'CRM',
      centre: 'South Satellite Centre',
      priority: 'Medium',
      status: 'Reopened',
      createdAt: '2026-07-17T12:10:00',
      lastUpdatedAt: '2026-07-18T10:05:00',
    },
    {
      id: 4,
      ticketId: 'ISD-2026-0134',
      subject: 'Required reagent stock is below minimum quantity',
      category: 'Reagent Requirement',
      createdBy: 'Riya Das',
      originatingDepartment: 'Laboratory',
      centre: 'Main Laboratory - Block A',
      priority: 'High',
      status: 'In Progress',
      createdAt: '2026-07-16T15:45:00',
      lastUpdatedAt: '2026-07-17T11:20:00',
    },
    {
      id: 5,
      ticketId: 'ISD-2026-0131',
      subject: 'Collection task is not visible to field executive',
      category: 'CRM Support Request',
      createdBy: 'Abhishek Roy',
      originatingDepartment: 'Logistics',
      centre: 'New Town Collection Centre',
      priority: 'Low',
      status: 'Assigned',
      createdAt: '2026-07-16T10:30:00',
      lastUpdatedAt: '2026-07-16T10:45:00',
    },
  ];

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