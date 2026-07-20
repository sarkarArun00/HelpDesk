import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

interface TeamEmployee {
  id: number;
  name: string;
  employeeCode: string;
  designation: string;
  activeTickets: number;
}

interface PoolTicket {
  id: number;
  ticketId: string;
  subject: string;
  category: string;
  createdBy: string;
  originatingDepartment: string;
  centre: string;
  priority: TicketPriority;
  targetDepartment: string;
  createdAt: string;
}

@Component({
  selector: 'app-team-pool',
  imports: [FormsModule, RouterLink],
  templateUrl: './team-pool.html',
  styleUrl: './team-pool.scss',
})
export class TeamPool {
  searchTerm = '';

  selectedPriority = '';

  selectedCentre = '';

  selectedCategory = '';

  selectedAssigneeId = 0;

  selectedTicket: PoolTicket | null = null;

  assignmentMessage = '';

  readonly currentDepartment = 'Logistics';

  readonly currentUserId = 101;

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

  readonly categories = [
    'Sample Collection Delay',
    'Vehicle Support',
    'Collection Executive Support',
    'Material Movement Request',
  ];

  readonly teamMembers: TeamEmployee[] = [
    {
      id: 101,
      name: 'Arun Sarkar',
      employeeCode: 'EMP-0101',
      designation: 'Logistics Executive',
      activeTickets: 3,
    },
    {
      id: 102,
      name: 'Rahul Sharma',
      employeeCode: 'EMP-0102',
      designation: 'Senior Logistics Executive',
      activeTickets: 5,
    },
    {
      id: 103,
      name: 'Ankit Kumar',
      employeeCode: 'EMP-0103',
      designation: 'Collection Coordinator',
      activeTickets: 2,
    },
    {
      id: 104,
      name: 'Pritam Dey',
      employeeCode: 'EMP-0104',
      designation: 'Field Operations Executive',
      activeTickets: 4,
    },
  ];

  tickets: PoolTicket[] = [
    {
      id: 1,
      ticketId: 'ISD-2026-0152',
      subject: 'Urgent sample pickup pending from collection centre',
      category: 'Sample Collection Delay',
      createdBy: 'Riya Das',
      originatingDepartment: 'CRM',
      centre: 'South Satellite Centre',
      priority: 'Critical',
      targetDepartment: 'Logistics',
      createdAt: '2026-07-18T10:20:00',
    },
    {
      id: 2,
      ticketId: 'ISD-2026-0150',
      subject: 'Vehicle unavailable for scheduled sample movement',
      category: 'Vehicle Support',
      createdBy: 'Amit Das',
      originatingDepartment: 'Laboratory',
      centre: 'Main Laboratory - Block A',
      priority: 'High',
      targetDepartment: 'Logistics',
      createdAt: '2026-07-18T09:45:00',
    },
    {
      id: 3,
      ticketId: 'ISD-2026-0148',
      subject: 'Collection executive requires task reassignment',
      category: 'Collection Executive Support',
      createdBy: 'Priya Sen',
      originatingDepartment: 'Operations',
      centre: 'New Town Collection Centre',
      priority: 'Medium',
      targetDepartment: 'Logistics',
      createdAt: '2026-07-17T17:15:00',
    },
    {
      id: 4,
      ticketId: 'ISD-2026-0146',
      subject: 'Temperature-controlled box movement required',
      category: 'Material Movement Request',
      createdBy: 'Sneha Roy',
      originatingDepartment: 'Laboratory',
      centre: 'Main Laboratory - Block A',
      priority: 'High',
      targetDepartment: 'Logistics',
      createdAt: '2026-07-17T14:35:00',
    },
    {
      id: 5,
      ticketId: 'ISD-2026-0144',
      subject: 'Field executive has not received collection address',
      category: 'Collection Executive Support',
      createdBy: 'Sourav Dey',
      originatingDepartment: 'CRM',
      centre: 'Corporate Office',
      priority: 'Low',
      targetDepartment: 'Logistics',
      createdAt: '2026-07-17T11:05:00',
    },
  ];

  get filteredTickets(): PoolTicket[] {
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

      const matchesPriority =
        !this.selectedPriority ||
        ticket.priority === this.selectedPriority;

      const matchesCentre =
        !this.selectedCentre ||
        ticket.centre === this.selectedCentre;

      const matchesCategory =
        !this.selectedCategory ||
        ticket.category === this.selectedCategory;

      return (
        matchesSearch &&
        matchesPriority &&
        matchesCentre &&
        matchesCategory
      );
    });
  }

  get hasActiveFilters(): boolean {
    return Boolean(
      this.searchTerm ||
        this.selectedPriority ||
        this.selectedCentre ||
        this.selectedCategory,
    );
  }

  get criticalCount(): number {
    return this.tickets.filter(
      ticket => ticket.priority === 'Critical',
    ).length;
  }

  get highPriorityCount(): number {
    return this.tickets.filter(
      ticket => ticket.priority === 'High',
    ).length;
  }

  get affectedCentreCount(): number {
    return new Set(
      this.tickets.map(ticket => ticket.centre),
    ).size;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedPriority = '';
    this.selectedCentre = '';
    this.selectedCategory = '';
  }

  openAssignmentModal(ticket: PoolTicket): void {
    this.selectedTicket = ticket;
    this.selectedAssigneeId = 0;
  }

  closeAssignmentModal(): void {
    this.selectedTicket = null;
    this.selectedAssigneeId = 0;
  }

  assignTicket(): void {
    if (!this.selectedTicket || !this.selectedAssigneeId) {
      return;
    }

    const employee = this.teamMembers.find(
      member => member.id === this.selectedAssigneeId,
    );

    if (!employee) {
      return;
    }

    const assignedTicketId = this.selectedTicket.ticketId;

    this.tickets = this.tickets.filter(
      ticket => ticket.id !== this.selectedTicket?.id,
    );

    this.assignmentMessage =
      `${assignedTicketId} has been assigned to ${employee.name}.`;

    this.closeAssignmentModal();
  }

  pickUpTicket(ticket: PoolTicket): void {
    this.tickets = this.tickets.filter(
      poolTicket => poolTicket.id !== ticket.id,
    );

    this.assignmentMessage =
      `${ticket.ticketId} has been assigned to you.`;
  }

  getSelectedEmployee(): TeamEmployee | undefined {
    return this.teamMembers.find(
      member => member.id === this.selectedAssigneeId,
    );
  }

  getInitials(fullName: string): string {
    if (!fullName.trim()) {
      return '--';
    }

    return fullName
      .trim()
      .split(/\s+/)
      .map(namePart => namePart.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }

  getPriorityClass(priority: TicketPriority): string {
    return `priority-${priority.toLowerCase()}`;
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