import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { TicketApiService } from '../../../tickets/services/ticket-api.service';
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
  employeePhoto?: string | null;
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
  departmentName: string;
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
export class UserMappingMaster
  implements OnInit {
  private readonly ticketApiService =
    inject(TicketApiService);

  isLoading = false;

  loadError = '';

  isUpdating = false;
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

  departments:
    DepartmentOption[] = [];

  users: UserMappingRecord[] = [
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


  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.loadError = '';

    this.ticketApiService
      .getEmployeeList()
      .subscribe({
        next: response => {
          this.isLoading = false;

          if (!response.success) {
            this.users = [];

            this.loadError =
              response.message ||
              'Unable to load employees.';

            return;
          }

          const departmentNames = [
            ...new Set(
              response.data.flatMap(
                employee =>
                  employee.departments ?? [],
              ),
            ),
          ].sort();

          this.departments =
            departmentNames.map(
              (departmentName, index) => ({
                id: index + 1,
                code: departmentName,
                name: departmentName,
              }),
            );

          this.users =
            response.data
              .map(employee => {
                const firstDepartment =
                  employee.departments?.[0] ??
                  '';

                const department =
                  this.departments.find(
                    item =>
                      item.name ===
                      firstDepartment,
                  );

                return {
                  id: String(employee.id),

                  employeeCode:
                    employee.employee_code,

                  fullName:
                    employee.employee_name,

                  corporateEmail:
                    employee.email_id ?? '',

                  employeePhoto:
                    employee.employeePhoto,

                  departmentId:
                    department?.id ?? 0,

                  departmentName:
                    employee.departments
                      ?.filter(Boolean)
                      .join(', ') ||
                    'Not assigned',

                  systemRole:
                    this.mapUserType(
                      employee.user_type,
                    ),

                  status:
                    employee.status,

                  // The current API does not
                  // provide an updated date.
                  updatedAt: '',
                };
              })
              .sort((first, second) =>
                first.fullName.localeCompare(
                  second.fullName,
                ),
              );
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.isLoading = false;
          this.users = [];

          this.loadError =
            error.error?.message ||
            'Unable to load employees.';
        },
      });
  }

  private mapUserType(
    userType: string,
  ): SystemRole {
    const normalized =
      userType
        ?.trim()
        .toLowerCase();

    if (
      normalized === 'admin' ||
      normalized === 'system admin'
    ) {
      return 'Admin';
    }

    if (
      normalized === 'manager' ||
      normalized ===
      'department manager'
    ) {
      return 'Department Manager';
    }

    return 'Employee';
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
      departmentName:
        user.departmentName,
      departmentId: user.departmentId,
      systemRole: user.systemRole,
      status: user.status,
    };

    this.formError = '';
    this.isModalVisible = true;
  }

  closeModal(): void {
    if (this.isUpdating) {
      return;
    }

    this.isModalVisible = false;
    this.editingUserId = null;
    this.userForm =
      this.createEmptyForm();
    this.formError = '';
  }

  saveUser(): void {
    this.formError = '';
    this.successMessage = '';

    if (!this.editingUserId) {
      this.formError =
        'Please select an employee to update.';

      return;
    }

    if (!this.userForm.systemRole) {
      this.formError =
        'Please select a system role.';

      return;
    }

    const employeeId =
      Number(this.editingUserId);

    if (!employeeId) {
      this.formError =
        'Invalid employee ID.';

      return;
    }

    const userType =
      this.mapRoleToUserType(
        this.userForm.systemRole,
      );

    this.isUpdating = true;

    this.ticketApiService
      .updateEmployee({
        id: employeeId,
        user_type: userType,
        is_active:
          this.userForm.status,
      })
      .subscribe({
        next: response => {
          this.isUpdating = false;

          if (!response.success) {
            this.formError =
              response.message ||
              'Unable to update employee.';

            return;
          }

          const employeeName =
            this.userForm.fullName;

          this.closeModal();

          this.successMessage =
            response.message ||
            `${employeeName} has been updated successfully.`;

          this.loadEmployees();
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.isUpdating = false;

          this.formError =
            error.error?.message ||
            'Unable to update employee. Please try again.';
        },
      });
  }

  private mapRoleToUserType(
    role: SystemRole,
  ): string {
    switch (role) {
      case 'Admin':
        return 'Admin';

      case 'Department Manager':
        return 'Manager';

      default:
        return 'Employee';
    }
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

  formatDate(
    dateValue:
      string | null | undefined,
  ): string {
    if (!dateValue) {
      return 'Not available';
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return 'Not available';
    }

    return new Intl.DateTimeFormat(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    ).format(date);
  }

  private createEmptyForm(): UserMappingForm {
    return {
      employeeCode: '',
      fullName: '',
      corporateEmail: '',
      departmentName: '',
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