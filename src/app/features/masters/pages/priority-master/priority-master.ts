import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

interface PriorityRecord {
  id: string;
  priorityLevel: TicketPriority;
  description: string;
  displayOrder: number;
  badgeColor: string;
  status: boolean;
  ticketCount: number;
  updatedAt: string;
}

interface PriorityFormModel {
  displayOrder: number;
  badgeColor: string;
  status: boolean;
}

@Component({
  selector: 'app-priority-master',
  imports: [FormsModule, RouterLink],
  templateUrl: './priority-master.html',
  styleUrl: './priority-master.scss',
})
export class PriorityMaster {
  searchTerm = '';

  selectedStatus = '';

  isModalVisible = false;

  selectedPriority: PriorityRecord | null = null;

  successMessage = '';

  formError = '';

  priorityForm: PriorityFormModel = this.createEmptyForm();

  priorities: PriorityRecord[] = [
    {
      id: 'PRI-001',
      priorityLevel: 'Critical',
      description:
        'Requires immediate operational attention due to significant business impact.',
      displayOrder: 1,
      badgeColor: '#b42318',
      status: true,
      ticketCount: 14,
      updatedAt: '2026-07-17T10:30:00',
    },
    {
      id: 'PRI-002',
      priorityLevel: 'High',
      description:
        'Important issue that should be handled before routine operational requests.',
      displayOrder: 2,
      badgeColor: '#b54708',
      status: true,
      ticketCount: 28,
      updatedAt: '2026-07-16T14:20:00',
    },
    {
      id: 'PRI-003',
      priorityLevel: 'Medium',
      description:
        'Standard operational request requiring normal processing attention.',
      displayOrder: 3,
      badgeColor: '#175cd3',
      status: true,
      ticketCount: 49,
      updatedAt: '2026-07-15T11:10:00',
    },
    {
      id: 'PRI-004',
      priorityLevel: 'Low',
      description:
        'Non-urgent request that can be handled after higher-priority work.',
      displayOrder: 4,
      badgeColor: '#475467',
      status: true,
      ticketCount: 21,
      updatedAt: '2026-07-14T16:45:00',
    },
  ];

  get filteredPriorities(): PriorityRecord[] {
    const search = this.searchTerm.trim().toLowerCase();

    return [...this.priorities]
      .filter(priority => {
        const matchesSearch =
          !search ||
          priority.priorityLevel.toLowerCase().includes(search) ||
          priority.description.toLowerCase().includes(search) ||
          priority.id.toLowerCase().includes(search);

        const matchesStatus =
          !this.selectedStatus ||
          (this.selectedStatus === 'active' && priority.status) ||
          (this.selectedStatus === 'inactive' && !priority.status);

        return matchesSearch && matchesStatus;
      })
      .sort(
        (firstPriority, secondPriority) =>
          firstPriority.displayOrder - secondPriority.displayOrder,
      );
  }

  get activePriorityCount(): number {
    return this.priorities.filter(priority => priority.status).length;
  }

  get inactivePriorityCount(): number {
    return this.priorities.filter(priority => !priority.status).length;
  }

  get totalTicketCount(): number {
    return this.priorities.reduce(
      (total, priority) => total + priority.ticketCount,
      0,
    );
  }

  get hasActiveFilters(): boolean {
    return Boolean(this.searchTerm || this.selectedStatus);
  }

  openEditModal(priority: PriorityRecord): void {
    this.selectedPriority = priority;

    this.priorityForm = {
      displayOrder: priority.displayOrder,
      badgeColor: priority.badgeColor,
      status: priority.status,
    };

    this.formError = '';
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.selectedPriority = null;
    this.priorityForm = this.createEmptyForm();
    this.formError = '';
  }

  savePriority(): void {
    this.formError = '';
    this.successMessage = '';

    if (!this.selectedPriority) {
      return;
    }

    if (
      !Number.isInteger(this.priorityForm.displayOrder) ||
      this.priorityForm.displayOrder < 1 ||
      this.priorityForm.displayOrder > 99
    ) {
      this.formError =
        'Display order must be a whole number between 1 and 99.';
      return;
    }

    if (!this.isValidHexColor(this.priorityForm.badgeColor)) {
      this.formError =
        'Enter a valid hexadecimal colour such as #B42318.';
      return;
    }

    const duplicateOrder = this.priorities.some(
      priority =>
        priority.displayOrder === this.priorityForm.displayOrder &&
        priority.id !== this.selectedPriority?.id,
    );

    if (duplicateOrder) {
      this.formError =
        'Another priority already uses this display order.';
      return;
    }

    const priorityId = this.selectedPriority.id;
    const priorityName = this.selectedPriority.priorityLevel;

    this.priorities = this.priorities.map(priority => {
      if (priority.id !== priorityId) {
        return priority;
      }

      return {
        ...priority,
        displayOrder: this.priorityForm.displayOrder,
        badgeColor: this.priorityForm.badgeColor.toLowerCase(),
        status: this.priorityForm.status,
        updatedAt: new Date().toISOString(),
      };
    });

    this.successMessage =
      `${priorityName} priority has been updated successfully.`;

    this.closeModal();
  }

  togglePriorityStatus(priority: PriorityRecord): void {
    this.priorities = this.priorities.map(item => {
      if (item.id !== priority.id) {
        return item;
      }

      return {
        ...item,
        status: !item.status,
        updatedAt: new Date().toISOString(),
      };
    });

    this.successMessage = priority.status
      ? `${priority.priorityLevel} priority has been deactivated.`
      : `${priority.priorityLevel} priority has been activated.`;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
  }

  getBackgroundColor(hexColor: string): string {
    return `${hexColor}18`;
  }

  getContrastColor(hexColor: string): string {
    const normalizedHex = hexColor.replace('#', '');

    if (normalizedHex.length !== 6) {
      return '#ffffff';
    }

    const red = Number.parseInt(normalizedHex.substring(0, 2), 16);
    const green = Number.parseInt(normalizedHex.substring(2, 4), 16);
    const blue = Number.parseInt(normalizedHex.substring(4, 6), 16);

    const brightness =
      (red * 299 + green * 587 + blue * 114) / 1000;

    return brightness > 160 ? '#101828' : '#ffffff';
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

  private createEmptyForm(): PriorityFormModel {
    return {
      displayOrder: 1,
      badgeColor: '#175cd3',
      status: true,
    };
  }

  private isValidHexColor(color: string): boolean {
    return /^#[0-9a-fA-F]{6}$/.test(color);
  }
}