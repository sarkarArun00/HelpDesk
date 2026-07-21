import {
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TicketCategoryApiService } from '../../services/ticket-category-api.service';
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
  // defaultPriority: TicketPriority;
  status: boolean;
  description: string;
  ticketCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TicketCategoryFormModel {
  categoryName: string;
  description: string;
  targetDepartmentId: number;
  // defaultPriority: TicketPriority | '';
  status: boolean;
}

@Component({
  selector: 'app-ticket-category-master',
  imports: [FormsModule, RouterLink],
  templateUrl: './ticket-category-master.html',
  styleUrl: './ticket-category-master.scss',
})
export class TicketCategoryMaster
  implements OnInit {

  searchTerm = '';

  selectedDepartmentId = 0;

  selectedPriority = '';

  selectedStatus = '';

  isModalVisible = false;

  editingCategoryId: string | null = null;

  successMessage = '';

  formError = '';

  // priorities: TicketPriority[] = [];

  // private readonly priorityNameById =
  //   new Map<number, TicketPriority>();

  private readonly ticketCategoryApiService =
    inject(TicketCategoryApiService);

  departments: DepartmentOption[] = [];

  categories: TicketCategoryRecord[] = [];

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

      // const matchesPriority =
      //   !this.selectedPriority ||
      //   category.defaultPriority === this.selectedPriority;

      const matchesStatus =
        !this.selectedStatus ||
        (this.selectedStatus === 'active' && category.status) ||
        (this.selectedStatus === 'inactive' && !category.status);

      return (
        matchesSearch &&
        matchesDepartment &&
        // matchesPriority &&
        matchesStatus
      );
    });
  }

  isLoading = false;

  isSaving = false;

  loadError = '';

  currentPage = 1;

  pageSize = 10;

  totalRecords = 0;

  totalPages = 0;

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


  ngOnInit(): void {
    this.loadCategories();
    // this.loadPriorities();
    this.loadDepartments();
  }


  loadCategories(
    page = this.currentPage,
  ): void {
    this.isLoading = true;
    this.loadError = '';

    this.ticketCategoryApiService
      .getAllCategories(
        page,
        this.pageSize,
      )
      .subscribe({
        next: response => {
          this.isLoading = false;

          if (!response.success) {
            this.categories = [];
            this.loadError =
              response.message ||
              'Unable to load ticket categories.';

            return;
          }

          this.categories =
            response.data.map(item => {
              const departmentId =
                item.department?.id ??
                item.department_id ??
                0;

              const departmentName =
                item.department?.departmentName ??
                this.departments.find(
                  department =>
                    department.id ===
                    departmentId,
                )?.name ??
                'Not assigned';

              return {
                id: String(item.id),

                categoryName:
                  item.category_name,

                description:
                  item.description ?? '',

                targetDepartmentId:
                  departmentId,

                targetDepartmentName:
                  departmentName,

                // defaultPriority:
                //   item.default_priority
                //     ? this.getPriorityName(
                //       item.default_priority,
                //     )
                //     : 'Medium',

                status: item.status,

                ticketCount: 0,

                createdAt:
                  item.created_at ??
                  item.department?.createdAt ??
                  '',

                updatedAt:
                  item.updated_at ??
                  item.department?.updatedAt ??
                  '',
              };
            });

          this.totalRecords =
            response.pagination.total;

          this.currentPage =
            response.pagination.page;

          this.pageSize =
            response.pagination.limit;

          this.totalPages =
            response.pagination.totalPages;
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.isLoading = false;
          this.categories = [];

          this.loadError =
            error.error?.message ||
            'Unable to load ticket categories.';
        },
      });
  }

  loadDepartments(): void {
    this.isLoading = true;
    this.loadError = '';

    this.ticketCategoryApiService
      .getAllDepartments()
      .subscribe({
        next: response => {
          if (!response.success) {
            this.isLoading = false;

            this.loadError =
              response.message ||
              'Unable to load departments.';

            return;
          }

          this.departments =
            response.data
              .filter(
                department =>
                  String(
                    department.status,
                  ) === '1',
              )
              .map(department => ({
                id: department.id,

                // The API does not provide
                // a department code.
                code: String(department.id),

                name:
                  department.departmentName,
              }))
              .sort((first, second) =>
                first.name.localeCompare(
                  second.name,
                ),
              );

          // this.loadPriorities();
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.isLoading = false;

          this.loadError =
            error.error?.message ||
            'Unable to load departments.';
        },
      });
  }

  // loadPriorities(): void {
  //   this.isLoading = true;
  //   this.loadError = '';

  //   this.ticketCategoryApiService
  //     .getAllPriorities()
  //     .subscribe({
  //       next: response => {
  //         if (!response.success) {
  //           this.isLoading = false;

  //           this.loadError =
  //             response.message ||
  //             'Unable to load priorities.';

  //           return;
  //         }

  //         const activePriorities =
  //           response.data
  //             .filter(priority => priority.status)
  //             .sort(
  //               (firstPriority, secondPriority) =>
  //                 secondPriority.priority_level -
  //                 firstPriority.priority_level,
  //             );

  //         this.priorities =
  //           activePriorities.map(
  //             priority =>
  //               priority.priority_name as TicketPriority,
  //           );

  //         this.priorityNameById.clear();

  //         activePriorities.forEach(priority => {
  //           this.priorityNameById.set(
  //             priority.id,
  //             priority.priority_name as TicketPriority,
  //           );
  //         });

  //         this.loadCategories();
  //       },

  //       error: (
  //         error: HttpErrorResponse,
  //       ) => {
  //         this.isLoading = false;

  //         this.loadError =
  //           error.error?.message ||
  //           'Unable to load ticket priorities.';
  //       },
  //     });
  // }

  // private getPriorityName(
  //   priorityId: number,
  // ): TicketPriority {
  //   return (
  //     this.priorityNameById.get(
  //       priorityId,
  //     ) ?? 'Medium'
  //   );
  // }

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
      description:
        category.description ?? '',
      targetDepartmentId:
        category.targetDepartmentId,
      // defaultPriority:
      //   category.defaultPriority,
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

    const description =
      this.categoryForm.description.trim();
    

    if (!categoryName) {
      this.formError =
        'Category name is required.';
      return;
    }

    if (categoryName.length < 3) {
      this.formError =
        'Category name must contain at least 3 characters.';
      return;
    }

    if (
      !this.categoryForm
        .targetDepartmentId
    ) {
      this.formError =
        'Please select a target department.';
      return;
    }

    if (!description) {
      this.formError =
        'Description is required.';
      return;
    }

    if (this.editingCategoryId) {
      const categoryId =
        Number(this.editingCategoryId);

      if (!categoryId) {
        this.formError =
          'Invalid category ID.';
        return;
      }

      this.isSaving = true;

      this.ticketCategoryApiService
        .updateCategory(categoryId, {
          category_name: categoryName,
          department_id:
            this.categoryForm
              .targetDepartmentId,
          description,
          status:
            this.categoryForm.status,
        })
        .subscribe({
          next: response => {
            this.isSaving = false;

            if (!response.success) {
              this.formError =
                response.message ||
                'Unable to update category.';

              return;
            }

            this.successMessage =
              response.message ||
              `${categoryName} has been updated successfully.`;

            this.closeModal();

            this.loadCategories(
              this.currentPage,
            );
          },

          error: (
            error: HttpErrorResponse,
          ) => {
            this.isSaving = false;

            this.formError =
              error.error?.message ||
              'Unable to update category. Please try again.';
          },
        });

      return;
    }

    this.isSaving = true;

    this.ticketCategoryApiService
      .createCategory({
        category_name: categoryName,
        department_id:
          this.categoryForm
            .targetDepartmentId,
        description,
        status:
          this.categoryForm.status,
      })
      .subscribe({
        next: response => {
          this.isSaving = false;

          if (!response.success) {
            this.formError =
              response.message ||
              'Unable to create category.';

            return;
          }

          this.successMessage =
            response.message ||
            `${categoryName} has been created successfully.`;

          this.closeModal();

          this.loadCategories(1);
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.isSaving = false;

          this.formError =
            error.error?.message ||
            'Unable to create category. Please try again.';
        },
      });
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
      description: '',
      targetDepartmentId: 0,
      // defaultPriority: '',
      status: true,
    };
  }

  // private generateCategoryId(): string {
  //   const highestId = this.categories.reduce(
  //     (maximumId, category) => {
  //       const numericId = Number(
  //         category.id.replace('CAT-', ''),
  //       );

  //       return Math.max(maximumId, numericId);
  //     },
  //     0,
  //   );

  //   return `CAT-${String(highestId + 1).padStart(
  //     3,
  //     '0',
  //   )}`;
  // }
}