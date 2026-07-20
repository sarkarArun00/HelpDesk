import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface DepartmentSupervisor {
  id: number;
  employeeCode: string;
  name: string;
  designation: string;
}

interface DepartmentRecord {
  id: string;
  departmentCode: string;
  departmentName: string;
  supervisorId: number;
  supervisorName: string;
  employeeCount: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DepartmentFormModel {
  departmentCode: string;
  departmentName: string;
  supervisorId: number;
  status: boolean;
}

@Component({
  selector: 'app-department-master',
  imports: [FormsModule, RouterLink],
  templateUrl: './department-master.html',
  styleUrl: './department-master.scss',
})
export class DepartmentMaster {
  searchTerm = '';

  selectedStatus = '';

  isDepartmentModalVisible = false;

  editingDepartmentId: string | null = null;

  successMessage = '';

  formError = '';

  readonly supervisors: DepartmentSupervisor[] = [
    {
      id: 101,
      employeeCode: 'EMP-0101',
      name: 'Arun Sarkar',
      designation: 'IT Manager',
    },
    {
      id: 102,
      employeeCode: 'EMP-0102',
      name: 'Rahul Sharma',
      designation: 'Logistics Manager',
    },
    {
      id: 103,
      employeeCode: 'EMP-0103',
      name: 'Priya Sen',
      designation: 'Accounts Manager',
    },
    {
      id: 104,
      employeeCode: 'EMP-0104',
      name: 'Amit Das',
      designation: 'Technical Manager',
    },
    {
      id: 105,
      employeeCode: 'EMP-0105',
      name: 'Sneha Roy',
      designation: 'Laboratory Manager',
    },
    {
      id: 106,
      employeeCode: 'EMP-0106',
      name: 'Sourav Dey',
      designation: 'CRM Manager',
    },
  ];

  departments: DepartmentRecord[] = [
    {
      id: 'DEP-001',
      departmentCode: 'IT',
      departmentName: 'Information Technology',
      supervisorId: 101,
      supervisorName: 'Arun Sarkar',
      employeeCount: 8,
      status: true,
      createdAt: '2026-05-10T10:15:00',
      updatedAt: '2026-07-12T14:30:00',
    },
    {
      id: 'DEP-002',
      departmentCode: 'LOG',
      departmentName: 'Logistics',
      supervisorId: 102,
      supervisorName: 'Rahul Sharma',
      employeeCount: 18,
      status: true,
      createdAt: '2026-05-10T10:20:00',
      updatedAt: '2026-07-10T11:40:00',
    },
    {
      id: 'DEP-003',
      departmentCode: 'ACC',
      departmentName: 'Accounts',
      supervisorId: 103,
      supervisorName: 'Priya Sen',
      employeeCount: 11,
      status: true,
      createdAt: '2026-05-10T10:25:00',
      updatedAt: '2026-07-11T16:10:00',
    },
    {
      id: 'DEP-004',
      departmentCode: 'TECH',
      departmentName: 'Technical',
      supervisorId: 104,
      supervisorName: 'Amit Das',
      employeeCount: 24,
      status: true,
      createdAt: '2026-05-10T10:30:00',
      updatedAt: '2026-07-09T12:25:00',
    },
    {
      id: 'DEP-005',
      departmentCode: 'LAB',
      departmentName: 'Laboratory',
      supervisorId: 105,
      supervisorName: 'Sneha Roy',
      employeeCount: 31,
      status: true,
      createdAt: '2026-05-10T10:35:00',
      updatedAt: '2026-07-08T15:20:00',
    },
    {
      id: 'DEP-006',
      departmentCode: 'CRM',
      departmentName: 'Customer Relationship Management',
      supervisorId: 106,
      supervisorName: 'Sourav Dey',
      employeeCount: 16,
      status: true,
      createdAt: '2026-05-10T10:40:00',
      updatedAt: '2026-07-07T13:50:00',
    },
    {
      id: 'DEP-007',
      departmentCode: 'PROC',
      departmentName: 'Procurement',
      supervisorId: 103,
      supervisorName: 'Priya Sen',
      employeeCount: 5,
      status: false,
      createdAt: '2026-05-11T09:25:00',
      updatedAt: '2026-06-28T10:10:00',
    },
  ];

  departmentForm: DepartmentFormModel =
    this.createEmptyDepartmentForm();

  get filteredDepartments(): DepartmentRecord[] {
    const normalizedSearch = this.searchTerm
      .trim()
      .toLowerCase();

    return this.departments.filter(department => {
      const matchesSearch =
        !normalizedSearch ||
        department.departmentCode
          .toLowerCase()
          .includes(normalizedSearch) ||
        department.departmentName
          .toLowerCase()
          .includes(normalizedSearch) ||
        department.supervisorName
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        !this.selectedStatus ||
        (this.selectedStatus === 'active' && department.status) ||
        (this.selectedStatus === 'inactive' && !department.status);

      return matchesSearch && matchesStatus;
    });
  }

  get activeDepartmentCount(): number {
    return this.departments.filter(
      department => department.status,
    ).length;
  }

  get inactiveDepartmentCount(): number {
    return this.departments.filter(
      department => !department.status,
    ).length;
  }

  get totalEmployeeCount(): number {
    return this.departments.reduce(
      (total, department) =>
        total + department.employeeCount,
      0,
    );
  }

  get hasActiveFilters(): boolean {
    return Boolean(this.searchTerm || this.selectedStatus);
  }

  openAddDepartmentModal(): void {
    this.editingDepartmentId = null;
    this.departmentForm = this.createEmptyDepartmentForm();
    this.formError = '';
    this.isDepartmentModalVisible = true;
  }

  openEditDepartmentModal(
    department: DepartmentRecord,
  ): void {
    this.editingDepartmentId = department.id;

    this.departmentForm = {
      departmentCode: department.departmentCode,
      departmentName: department.departmentName,
      supervisorId: department.supervisorId,
      status: department.status,
    };

    this.formError = '';
    this.isDepartmentModalVisible = true;
  }

  closeDepartmentModal(): void {
    this.isDepartmentModalVisible = false;
    this.editingDepartmentId = null;
    this.departmentForm = this.createEmptyDepartmentForm();
    this.formError = '';
  }

  saveDepartment(): void {
    this.formError = '';
    this.successMessage = '';

    const departmentCode =
      this.departmentForm.departmentCode
        .trim()
        .toUpperCase();

    const departmentName =
      this.departmentForm.departmentName.trim();

    if (!departmentCode) {
      this.formError = 'Department code is required.';
      return;
    }

    if (!departmentName) {
      this.formError = 'Department name is required.';
      return;
    }

    if (!this.departmentForm.supervisorId) {
      this.formError =
        'Please select a department supervisor.';
      return;
    }

    const duplicateCode = this.departments.some(
      department =>
        department.departmentCode.toLowerCase() ===
          departmentCode.toLowerCase() &&
        department.id !== this.editingDepartmentId,
    );

    if (duplicateCode) {
      this.formError =
        'A department with this code already exists.';
      return;
    }

    const duplicateName = this.departments.some(
      department =>
        department.departmentName.toLowerCase() ===
          departmentName.toLowerCase() &&
        department.id !== this.editingDepartmentId,
    );

    if (duplicateName) {
      this.formError =
        'A department with this name already exists.';
      return;
    }

    const supervisor = this.supervisors.find(
      item =>
        item.id === this.departmentForm.supervisorId,
    );

    if (!supervisor) {
      this.formError =
        'The selected supervisor could not be found.';
      return;
    }

    const currentDate = new Date().toISOString();

    if (this.editingDepartmentId) {
      this.departments = this.departments.map(
        department => {
          if (
            department.id !== this.editingDepartmentId
          ) {
            return department;
          }

          return {
            ...department,
            departmentCode,
            departmentName,
            supervisorId: supervisor.id,
            supervisorName: supervisor.name,
            status: this.departmentForm.status,
            updatedAt: currentDate,
          };
        },
      );

      this.successMessage =
        `${departmentName} has been updated successfully.`;
    } else {
      const newDepartment: DepartmentRecord = {
        id: this.generateDepartmentId(),
        departmentCode,
        departmentName,
        supervisorId: supervisor.id,
        supervisorName: supervisor.name,
        employeeCount: 0,
        status: this.departmentForm.status,
        createdAt: currentDate,
        updatedAt: currentDate,
      };

      this.departments = [
        newDepartment,
        ...this.departments,
      ];

      this.successMessage =
        `${departmentName} has been created successfully.`;
    }

    this.closeDepartmentModal();
  }

  toggleDepartmentStatus(
    department: DepartmentRecord,
  ): void {
    this.departments = this.departments.map(item => {
      if (item.id !== department.id) {
        return item;
      }

      return {
        ...item,
        status: !item.status,
        updatedAt: new Date().toISOString(),
      };
    });

    this.successMessage = department.status
      ? `${department.departmentName} has been deactivated.`
      : `${department.departmentName} has been activated.`;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
  }

  getInitials(fullName: string): string {
    if (!fullName?.trim()) {
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

  private createEmptyDepartmentForm():
    DepartmentFormModel {
    return {
      departmentCode: '',
      departmentName: '',
      supervisorId: 0,
      status: true,
    };
  }

  private generateDepartmentId(): string {
    const highestId = this.departments.reduce(
      (maximumId, department) => {
        const numericId = Number(
          department.id.replace('DEP-', ''),
        );

        return Math.max(maximumId, numericId);
      },
      0,
    );

    return `DEP-${String(highestId + 1).padStart(
      3,
      '0',
    )}`;
  }
}