import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

interface DepartmentOption {
  id: number;
  code: string;
  name: string;
}

interface TicketCategoryRecord {
  id: string;
  categoryName: string;
  targetDepartmentId: number;
  targetDepartmentName: string;
  defaultPriority: TicketPriority;
  status: boolean;
  ticketCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TicketCategoryFormModel {
  categoryName: string;
  targetDepartmentId: number;
  defaultPriority: TicketPriority | '';
  status: boolean;
}

@Component({
  selector: 'app-ticket-category-master',
  imports: [FormsModule, RouterLink],
  templateUrl: './ticket-category-master.html',
  styleUrl: './ticket-category-master.scss',
})
export class TicketCategoryMaster {
  searchTerm = '';

  selectedDepartmentId = 0;

  selectedPriority = '';

  selectedStatus = '';

  isModalVisible = false;

  editingCategoryId: string | null = null;

  successMessage = '';

  formError = '';

  readonly priorities: TicketPriority[] = [
    'Critical',
    'High',
    'Medium',
    'Low',
  ];

  readonly departments: DepartmentOption[] = [
    {
      id: 1,
      code: 'IT',
      name: 'Information Technology',
    },
    {
      id: 2,
      code: 'LOG',
      name: 'Logistics',
    },
    {
      id: 3,
      code: 'ACC',
      name: 'Accounts',
    },
    {
      id: 4,
      code: 'TECH',
      name: 'Technical',
    },
    {
      id: 5,
      code: 'LAB',
      name: 'Laboratory',
    },
    {
      id: 6,
      code: 'CRM',
      name: 'Customer Relationship Management',
    },
  ];

  categories: TicketCategoryRecord[] = [
    {
      id: 'CAT-001',
      categoryName: 'Sample Collection Delay',
      targetDepartmentId: 2,
      targetDepartmentName: 'Logistics',
      defaultPriority: 'Critical',
      status: true,
      ticketCount: 28,
      createdAt: '2026-05-15T10:10:00',
      updatedAt: '2026-07-17T11:20:00',
    },
    {
      id: 'CAT-002',
      categoryName: 'Invoice Discrepancy',
      targetDepartmentId: 3,
      targetDepartmentName: 'Accounts',
      defaultPriority: 'High',
      status: true,
      ticketCount: 17,
      createdAt: '2026-05-15T10:15:00',
      updatedAt: '2026-07-16T15:30:00',
    },
    {
      id: 'CAT-003',
      categoryName: 'Report Correction',
      targetDepartmentId: 4,
      targetDepartmentName: 'Technical',
      defaultPriority: 'Medium',
      status: true,
      ticketCount: 22,
      createdAt: '2026-05-15T10:20:00',
      updatedAt: '2026-07-16T12:10:00',
    },
    {
      id: 'CAT-004',
      categoryName: 'Reagent Requirement',
      targetDepartmentId: 5,
      targetDepartmentName: 'Laboratory',
      defaultPriority: 'High',
      status: true,
      ticketCount: 14,
      createdAt: '2026-05-15T10:25:00',
      updatedAt: '2026-07-15T16:50:00',
    },
    {
      id: 'CAT-005',
      categoryName: 'CRM Support Request',
      targetDepartmentId: 6,
      targetDepartmentName: 'Customer Relationship Management',
      defaultPriority: 'Medium',
      status: true,
      ticketCount: 31,
      createdAt: '2026-05-15T10:30:00',
      updatedAt: '2026-07-15T13:45:00',
    },
    {
      id: 'CAT-006',
      categoryName: 'Application Access Issue',
      targetDepartmentId: 1,
      targetDepartmentName: 'Information Technology',
      defaultPriority: 'High',
      status: true,
      ticketCount: 19,
      createdAt: '2026-05-15T10:35:00',
      updatedAt: '2026-07-14T17:25:00',
    },
    {
      id: 'CAT-007',
      categoryName: 'Vehicle Support',
      targetDepartmentId: 2,
      targetDepartmentName: 'Logistics',
      defaultPriority: 'Medium',
      status: false,
      ticketCount: 7,
      createdAt: '2026-05-16T09:20:00',
      updatedAt: '2026-07-10T11:40:00',
    },
  ];

  categoryForm: TicketCategoryFormModel =
    this.createEmptyForm();

  get filteredCategories(): TicketCategoryRecord[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.categories.filter(category => {
      const matchesSearch =
        !search ||
        category.id.toLowerCase().includes(search) ||
        category.categoryName.toLowerCase().includes(search) ||
        category.targetDepartmentName
          .toLowerCase()
          .includes(search);

      const matchesDepartment =
        !this.selectedDepartmentId ||
        category.targetDepartmentId ===
          this.selectedDepartmentId;

      const matchesPriority =
        !this.selectedPriority ||
        category.defaultPriority === this.selectedPriority;

      const matchesStatus =
        !this.selectedStatus ||
        (this.selectedStatus === 'active' && category.status) ||
        (this.selectedStatus === 'inactive' && !category.status);

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesPriority &&
        matchesStatus
      );
    });
  }

  get activeCategoryCount(): number {
    return this.categories.filter(
      category => category.status,
    ).length;
  }

  get inactiveCategoryCount(): number {
    return this.categories.filter(
      category => !category.status,
    ).length;
  }

  get mappedDepartmentCount(): number {
    return new Set(
      this.categories.map(
        category => category.targetDepartmentId,
      ),
    ).size;
  }

  get totalTicketCount(): number {
    return this.categories.reduce(
      (total, category) => total + category.ticketCount,
      0,
    );
  }

  get hasActiveFilters(): boolean {
    return Boolean(
      this.searchTerm ||
        this.selectedDepartmentId ||
        this.selectedPriority ||
        this.selectedStatus,
    );
  }

  openAddModal(): void {
    this.editingCategoryId = null;
    this.categoryForm = this.createEmptyForm();
    this.formError = '';
    this.isModalVisible = true;
  }

  openEditModal(category: TicketCategoryRecord): void {
    this.editingCategoryId = category.id;

    this.categoryForm = {
      categoryName: category.categoryName,
      targetDepartmentId: category.targetDepartmentId,
      defaultPriority: category.defaultPriority,
      status: category.status,
    };

    this.formError = '';
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.editingCategoryId = null;
    this.categoryForm = this.createEmptyForm();
    this.formError = '';
  }

  saveCategory(): void {
    this.formError = '';
    this.successMessage = '';

    const categoryName =
      this.categoryForm.categoryName.trim();

    if (!categoryName) {
      this.formError = 'Category name is required.';
      return;
    }

    if (categoryName.length < 3) {
      this.formError =
        'Category name must contain at least 3 characters.';
      return;
    }

    if (!this.categoryForm.targetDepartmentId) {
      this.formError =
        'Please select a target department.';
      return;
    }

    if (!this.categoryForm.defaultPriority) {
      this.formError =
        'Please select a default priority.';
      return;
    }

    const duplicateCategory = this.categories.some(
      category =>
        category.categoryName.toLowerCase() ===
          categoryName.toLowerCase() &&
        category.id !== this.editingCategoryId,
    );

    if (duplicateCategory) {
      this.formError =
        'A ticket category with this name already exists.';
      return;
    }

    const targetDepartment = this.departments.find(
      department =>
        department.id ===
        this.categoryForm.targetDepartmentId,
    );

    if (!targetDepartment) {
      this.formError =
        'The selected target department could not be found.';
      return;
    }

    const currentDate = new Date().toISOString();

    if (this.editingCategoryId) {
      this.categories = this.categories.map(category => {
        if (category.id !== this.editingCategoryId) {
          return category;
        }

        return {
          ...category,
          categoryName,
          targetDepartmentId: targetDepartment.id,
          targetDepartmentName: targetDepartment.name,
          defaultPriority:
            this.categoryForm
              .defaultPriority as TicketPriority,
          status: this.categoryForm.status,
          updatedAt: currentDate,
        };
      });

      this.successMessage =
        `${categoryName} has been updated successfully.`;
    } else {
      const newCategory: TicketCategoryRecord = {
        id: this.generateCategoryId(),
        categoryName,
        targetDepartmentId: targetDepartment.id,
        targetDepartmentName: targetDepartment.name,
        defaultPriority:
          this.categoryForm
            .defaultPriority as TicketPriority,
        status: this.categoryForm.status,
        ticketCount: 0,
        createdAt: currentDate,
        updatedAt: currentDate,
      };

      this.categories = [
        newCategory,
        ...this.categories,
      ];

      this.successMessage =
        `${categoryName} has been created successfully.`;
    }

    this.closeModal();
  }

  toggleCategoryStatus(
    category: TicketCategoryRecord,
  ): void {
    this.categories = this.categories.map(item => {
      if (item.id !== category.id) {
        return item;
      }

      return {
        ...item,
        status: !item.status,
        updatedAt: new Date().toISOString(),
      };
    });

    this.successMessage = category.status
      ? `${category.categoryName} has been deactivated.`
      : `${category.categoryName} has been activated.`;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDepartmentId = 0;
    this.selectedPriority = '';
    this.selectedStatus = '';
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

  private createEmptyForm(): TicketCategoryFormModel {
    return {
      categoryName: '',
      targetDepartmentId: 0,
      defaultPriority: '',
      status: true,
    };
  }

  private generateCategoryId(): string {
    const highestId = this.categories.reduce(
      (maximumId, category) => {
        const numericId = Number(
          category.id.replace('CAT-', ''),
        );

        return Math.max(maximumId, numericId);
      },
      0,
    );

    return `CAT-${String(highestId + 1).padStart(
      3,
      '0',
    )}`;
  }
}