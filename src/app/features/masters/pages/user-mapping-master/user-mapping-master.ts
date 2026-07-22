import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type SystemRole =
  | 'Admin'
  | 'Department Manager'
  | 'Employee';

interface DepartmentOption {
  id: number;
  code: string;
  name: string;
}

interface UserMappingRecord {
  id: string;
  employeeCode: string;
  fullName: string;
  corporateEmail: string;
  departmentId: number;
  departmentName: string;
  systemRole: SystemRole;
  status: boolean;
  updatedAt: string;
}

interface UserMappingForm {
  employeeCode: string;
  fullName: string;
  corporateEmail: string;
  departmentId: number;
  systemRole: SystemRole | '';
  status: boolean;
}

@Component({
  selector: 'app-user-mapping-master',
  imports: [FormsModule, RouterLink],
  templateUrl: './user-mapping-master.html',
  styleUrl: './user-mapping-master.scss',
})
export class UserMappingMaster {
  searchTerm = '';

  selectedDepartmentId = 0;

  selectedRole = '';

  selectedStatus = '';

  isModalVisible = false;

  editingUserId: string | null = null;

  successMessage = '';

  formError = '';

  readonly roles: SystemRole[] = [
    'Admin',
    'Department Manager',
    'Employee',
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

  users: UserMappingRecord[] = [
    {
      id: 'USR-001',
      employeeCode: 'EMP-0101',
      fullName: 'Arun Sarkar',
      corporateEmail: 'arun.sarkar@nirnayanhealthcare.com',
      departmentId: 1,
      departmentName: 'Information Technology',
      systemRole: 'Admin',
      status: true,
      updatedAt: '2026-07-17T12:20:00',
    },
    {
      id: 'USR-002',
      employeeCode: 'EMP-0102',
      fullName: 'Rahul Sharma',
      corporateEmail: 'rahul.sharma@nirnayanhealthcare.com',
      departmentId: 2,
      departmentName: 'Logistics',
      systemRole: 'Department Manager',
      status: true,
      updatedAt: '2026-07-16T15:45:00',
    },
    {
      id: 'USR-003',
      employeeCode: 'EMP-0103',
      fullName: 'Priya Sen',
      corporateEmail: 'priya.sen@nirnayanhealthcare.com',
      departmentId: 3,
      departmentName: 'Accounts',
      systemRole: 'Department Manager',
      status: true,
      updatedAt: '2026-07-16T11:30:00',
    },
    {
      id: 'USR-004',
      employeeCode: 'EMP-0104',
      fullName: 'Amit Das',
      corporateEmail: 'amit.das@nirnayanhealthcare.com',
      departmentId: 4,
      departmentName: 'Technical',
      systemRole: 'Department Manager',
      status: true,
      updatedAt: '2026-07-15T17:10:00',
    },
    {
      id: 'USR-005',
      employeeCode: 'EMP-0105',
      fullName: 'Sneha Roy',
      corporateEmail: 'sneha.roy@nirnayanhealthcare.com',
      departmentId: 5,
      departmentName: 'Laboratory',
      systemRole: 'Department Manager',
      status: true,
      updatedAt: '2026-07-15T10:05:00',
    },
    {
      id: 'USR-006',
      employeeCode: 'EMP-0106',
      fullName: 'Sourav Dey',
      corporateEmail: 'sourav.dey@nirnayanhealthcare.com',
      departmentId: 6,
      departmentName: 'Customer Relationship Management',
      systemRole: 'Employee',
      status: true,
      updatedAt: '2026-07-14T14:25:00',
    },
    {
      id: 'USR-007',
      employeeCode: 'EMP-0107',
      fullName: 'Ankit Kumar',
      corporateEmail: 'ankit.kumar@nirnayanhealthcare.com',
      departmentId: 2,
      departmentName: 'Logistics',
      systemRole: 'Employee',
      status: false,
      updatedAt: '2026-07-10T09:40:00',
    },
  ];

  userForm: UserMappingForm = this.createEmptyForm();

  get filteredUsers(): UserMappingRecord[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.users.filter(user => {
      const matchesSearch =
        !search ||
        user.employeeCode.toLowerCase().includes(search) ||
        user.fullName.toLowerCase().includes(search) ||
        user.corporateEmail.toLowerCase().includes(search);

      const matchesDepartment =
        !this.selectedDepartmentId ||
        user.departmentId === this.selectedDepartmentId;

      const matchesRole =
        !this.selectedRole ||
        user.systemRole === this.selectedRole;

      const matchesStatus =
        !this.selectedStatus ||
        (this.selectedStatus === 'active' && user.status) ||
        (this.selectedStatus === 'inactive' && !user.status);

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesRole &&
        matchesStatus
      );
    });
  }

  get activeUserCount(): number {
    return this.users.filter(user => user.status).length;
  }

  get inactiveUserCount(): number {
    return this.users.filter(user => !user.status).length;
  }

  get managerCount(): number {
    return this.users.filter(
      user => user.systemRole === 'Department Manager',
    ).length;
  }

  get hasActiveFilters(): boolean {
    return Boolean(
      this.searchTerm ||
        this.selectedDepartmentId ||
        this.selectedRole ||
        this.selectedStatus,
    );
  }

  openAddModal(): void {
    this.editingUserId = null;
    this.userForm = this.createEmptyForm();
    this.formError = '';
    this.isModalVisible = true;
  }

  openEditModal(user: UserMappingRecord): void {
    this.editingUserId = user.id;

    this.userForm = {
      employeeCode: user.employeeCode,
      fullName: user.fullName,
      corporateEmail: user.corporateEmail,
      departmentId: user.departmentId,
      systemRole: user.systemRole,
      status: user.status,
    };

    this.formError = '';
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.editingUserId = null;
    this.userForm = this.createEmptyForm();
    this.formError = '';
  }

  saveUser(): void {
    this.formError = '';
    this.successMessage = '';

    const employeeCode =
      this.userForm.employeeCode.trim().toUpperCase();

    const fullName = this.userForm.fullName.trim();

    const corporateEmail =
      this.userForm.corporateEmail.trim().toLowerCase();

    if (!employeeCode) {
      this.formError = 'Employee code is required.';
      return;
    }

    if (!fullName) {
      this.formError = 'Employee full name is required.';
      return;
    }

    if (!this.isValidEmail(corporateEmail)) {
      this.formError =
        'Enter a valid corporate email address.';
      return;
    }

    if (!this.userForm.departmentId) {
      this.formError = 'Please select a department.';
      return;
    }

    if (!this.userForm.systemRole) {
      this.formError = 'Please select a system role.';
      return;
    }

    const duplicateEmployeeCode = this.users.some(
      user =>
        user.employeeCode.toLowerCase() ===
          employeeCode.toLowerCase() &&
        user.id !== this.editingUserId,
    );

    if (duplicateEmployeeCode) {
      this.formError =
        'This employee code is already mapped.';
      return;
    }

    const duplicateEmail = this.users.some(
      user =>
        user.corporateEmail.toLowerCase() ===
          corporateEmail &&
        user.id !== this.editingUserId,
    );

    if (duplicateEmail) {
      this.formError =
        'This corporate email is already mapped.';
      return;
    }

    const department = this.departments.find(
      item => item.id === this.userForm.departmentId,
    );

    if (!department) {
      this.formError =
        'The selected department could not be found.';
      return;
    }

    const updatedAt = new Date().toISOString();

    if (this.editingUserId) {
      this.users = this.users.map(user => {
        if (user.id !== this.editingUserId) {
          return user;
        }

        return {
          ...user,
          employeeCode,
          fullName,
          corporateEmail,
          departmentId: department.id,
          departmentName: department.name,
          systemRole: this.userForm.systemRole as SystemRole,
          status: this.userForm.status,
          updatedAt,
        };
      });

      this.successMessage =
        `${fullName}'s user mapping has been updated.`;
    } else {
      const newUser: UserMappingRecord = {
        id: this.generateUserId(),
        employeeCode,
        fullName,
        corporateEmail,
        departmentId: department.id,
        departmentName: department.name,
        systemRole: this.userForm.systemRole as SystemRole,
        status: this.userForm.status,
        updatedAt,
      };

      this.users = [newUser, ...this.users];

      this.successMessage =
        `${fullName} has been mapped successfully.`;
    }

    this.closeModal();
  }

  toggleUserStatus(user: UserMappingRecord): void {
    this.users = this.users.map(item => {
      if (item.id !== user.id) {
        return item;
      }

      return {
        ...item,
        status: !item.status,
        updatedAt: new Date().toISOString(),
      };
    });

    this.successMessage = user.status
      ? `${user.fullName} has been deactivated.`
      : `${user.fullName} has been activated.`;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDepartmentId = 0;
    this.selectedRole = '';
    this.selectedStatus = '';
  }

  getInitials(fullName: string): string {
    if (!fullName?.trim()) {
      return '--';
    }

    return fullName
      .trim()
      .split(/\s+/)
      .map(name => name.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }

  getRoleClass(role: SystemRole): string {
    switch (role) {
      case 'Admin':
        return 'role-admin';

      case 'Department Manager':
        return 'role-manager';

      default:
        return 'role-employee';
    }
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

  private createEmptyForm(): UserMappingForm {
    return {
      employeeCode: '',
      fullName: '',
      corporateEmail: '',
      departmentId: 0,
      systemRole: '',
      status: true,
    };
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private generateUserId(): string {
    const highestId = this.users.reduce(
      (maximumId, user) => {
        const id = Number(user.id.replace('USR-', ''));

        return Math.max(maximumId, id);
      },
      0,
    );

    return `USR-${String(highestId + 1).padStart(3, '0')}`;
  }
}