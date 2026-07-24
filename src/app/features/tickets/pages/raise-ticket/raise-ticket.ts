import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TicketCategoryApiService } from '../../../masters/services/ticket-category-api.service';
import { TicketApiService } from '../../services/ticket-api.service';

import { AuthService } from '../../../../core/auth/services/auth.service';
import {
  TicketAttachment,
  TicketPriority,
} from '../../../../core/tickets/models/ticket.model';
import { TicketStoreService } from '../../../../core/tickets/services/ticket-store.service';

// type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

interface TicketCategory {
  id: number;
  name: string;
  departmentId: number;
  targetDepartment: string;
  defaultPriority: TicketPriority;
}

interface Centre {
  id: number;
  code: string;
  name: string;
}

@Component({
  selector: 'app-raise-ticket',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './raise-ticket.html',
  styleUrl: './raise-ticket.scss',
})
export class RaiseTicket
  implements OnInit {
  private readonly ticketApiService =
    inject(TicketApiService);

  private readonly ticketCategoryApiService =
    inject(TicketCategoryApiService);

  private readonly centreApiService =
    inject(TicketCategoryApiService);
  private readonly formBuilder = inject(FormBuilder);

  private readonly router =
    inject(Router);


  isLoadingMasters = false;

  masterLoadError = '';

  isSubmitting = false;

  private readonly authService =
  inject(AuthService);

private readonly ticketStore =
  inject(TicketStoreService);

  createdTicketId = '';

  submissionError = '';

  priorities: TicketPriority[] = [];

  categories: TicketCategory[] = [];

  centres: Centre[] = [];

  private readonly priorityIdByName =
    new Map<TicketPriority, number>();

  private mapAttachments(
  files: File[],
  uploadedBy: string,
): TicketAttachment[] {
  const uploadedAt = new Date().toISOString();

  return files.map((file, index) => ({
    id: `attachment-${Date.now()}-${index}`,
    name: file.name,
    mimeType:
      file.type || 'application/octet-stream',
    sizeBytes: file.size,
    uploadedBy,
    uploadedAt,
  }));
}

  readonly ticketForm = this.formBuilder.nonNullable.group({
    creatorName: [
      {
        value:
          this.authService.currentUser()?.fullName ?? '',
        disabled: true,
      },
    ],

    originatingDepartment: [
      {
        value:
          this.authService.currentUser()?.department ?? '',
        disabled: true,
      },
    ],

    createdAt: [
      {
        value: this.getCurrentDateTime(),
        disabled: true,
      },
    ],

    subject: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(120),
      ],
    ],

    categoryId: [0, [Validators.required, Validators.min(1)]],

    targetDepartment: [
      {
        value: '',
        disabled: true,
      },
    ],

    centreId: [0, [Validators.required, Validators.min(1)]],

    priority: ['', Validators.required],

    description: [
      '',
      [
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(2000),
      ],
    ],
  });

  selectedFiles: File[] = [];

  fileError = '';

  submissionMessage = '';

  readonly maximumFileSize = 5 * 1024 * 1024;

  readonly allowedMimeTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
  ];


  ngOnInit(): void {
    this.loadTicketMasters();
  }

  loadTicketMasters(): void {
    this.isLoadingMasters = true;
    this.masterLoadError = '';

    forkJoin({
      categories:
        this.ticketCategoryApiService
          .getAllCategories(1, 100),

      priorities:
        this.ticketCategoryApiService
          .getAllPriorities(),

      centres:
        this.centreApiService
          .getAllCentres(),
    }).subscribe({
      next: response => {
        this.isLoadingMasters = false;

        if (
          !response.categories.success ||
          !response.priorities.success ||
          !response.centres.success
        ) {
          this.masterLoadError =
            'Unable to load ticket form data.';

          return;
        }

        const activePriorities =
          response.priorities.data.filter(
            priority => priority.status,
          );

        this.priorityIdByName.clear();

        this.priorities =
          activePriorities
            .sort(
              (first, second) =>
                second.priority_level -
                first.priority_level,
            )
            .map(priority => {
              const priorityName =
                priority.priority_name as
                TicketPriority;

              this.priorityIdByName.set(
                priorityName,
                priority.id,
              );

              return priorityName;
            });

        this.categories =
          response.categories.data
            .filter(category =>
              Boolean(category.status),
            )
            .map(category => {
              const departmentId =
                category.department?.id ??
                category.department_id ??
                0;

              const defaultPriority =
                activePriorities.find(
                  priority =>
                    priority.id ===
                    category.default_priority,
                );

              return {
                id: category.id,
                name:
                  category.category_name,
                departmentId,
                targetDepartment:
                  category.department
                    ?.departmentName ??
                  'Not assigned',
                defaultPriority:
                  (defaultPriority
                    ?.priority_name ??
                    'Medium') as
                  TicketPriority,
              };
            })
            .sort((first, second) =>
              first.name.localeCompare(
                second.name,
              ),
            );

        this.centres =
          response.centres.data
            .map(centre => ({
              id: centre.id,
              code: centre.centreCode,
              name:
                centre.centreName.trim(),
            }))
            .sort((first, second) =>
              first.name.localeCompare(
                second.name,
              ),
            );
      },

      error: (
        error: HttpErrorResponse,
      ) => {
        this.isLoadingMasters = false;

        this.masterLoadError =
          error.error?.message ||
          'Unable to load ticket form data.';
      },
    });
  }

  onCategoryChange(categoryId: number): void {
    const selectedCategory = this.categories.find(
      category => category.id === categoryId,
    );

    if (!selectedCategory) {
      this.ticketForm.patchValue({
        targetDepartment: '',
        priority: '',
      });

      return;
    }

    this.ticketForm.patchValue({
      targetDepartment: selectedCategory.targetDepartment,
      priority: selectedCategory.defaultPriority,
    });
  }

  onFileSelected(event: Event): void {
    this.fileError = '';

    const inputElement = event.target as HTMLInputElement;
    const files = Array.from(inputElement.files ?? []);

    if (!files.length) {
      return;
    }

    const validFiles: File[] = [];

    for (const file of files) {
      if (!this.isAllowedFile(file)) {
        this.fileError =
          'Only PDF, PNG, JPG and JPEG files are allowed.';

        continue;
      }

      if (file.size > this.maximumFileSize) {
        this.fileError =
          `${file.name} exceeds the maximum file size of 5 MB.`;

        continue;
      }

      const alreadySelected = this.selectedFiles.some(
        selectedFile =>
          selectedFile.name === file.name &&
          selectedFile.size === file.size,
      );

      if (alreadySelected) {
        this.fileError = `${file.name} has already been selected.`;

        continue;
      }

      validFiles.push(file);
    }

    this.selectedFiles = [
      ...this.selectedFiles,
      ...validFiles,
    ];

    inputElement.value = '';
  }

  removeFile(index: number): void {
    this.selectedFiles = this.selectedFiles.filter(
      (_, fileIndex) => fileIndex !== index,
    );

    this.fileError = '';
  }

  getFileSize(sizeInBytes: number): string {
    if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    }

    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  onSubmit(): void {
    this.createdTicketId = '';
    this.submissionError = '';
    this.submissionMessage = '';

    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    const currentUser =
      this.authService.currentUser();

    if (!currentUser?.id) {
      this.submissionError =
        'Your login profile is unavailable. Please sign in again.';

      return;
    }

    const formValue =
      this.ticketForm.getRawValue();

    const selectedCategory =
      this.categories.find(
        category =>
          category.id ===
          formValue.categoryId,
      );

    if (
      !selectedCategory ||
      !selectedCategory.departmentId
    ) {
      this.submissionError =
        'The selected category does not have a valid department.';

      return;
    }

    const selectedCentre =
      this.centres.find(
        centre =>
          centre.id ===
          formValue.centreId,
      );

    if (!selectedCentre) {
      this.submissionError =
        'Please select a valid centre.';
      return;
    }

    const priorityId =
      this.priorityIdByName.get(
        formValue.priority as
        TicketPriority,
      );

    if (!priorityId) {
      this.submissionError =
        'Please select a valid priority.';
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();

    formData.append(
      'subject',
      formValue.subject.trim(),
    );

    formData.append(
      'description',
      formValue.description.trim(),
    );

    formData.append(
      'requester_id',
      String(currentUser.id),
    );

    formData.append(
      'category_id',
      String(selectedCategory.id),
    );

    formData.append(
      'department_id',
      String(
        selectedCategory.departmentId,
      ),
    );

    formData.append(
      'centre_id',
      String(selectedCentre.id),
    );

    formData.append(
      'priority_id',
      String(priorityId),
    );

    formData.append(
      'status',
      'ASSIGNED',
    );

    this.selectedFiles.forEach(file => {
      formData.append(
        'attachments',
        file,
        file.name,
      );
    });

    this.isSubmitting = true;

    this.ticketApiService
      .createTicket(formData)
      .subscribe({
        next: response => {
          this.isSubmitting = false;

          if (!response.success) {
            this.submissionError =
              response.message ||
              'Unable to create ticket.';

            return;
          }

          this.createdTicketId =
            response.data
              ?.ticket_number ?? '';

          this.submissionMessage =
            response.message ||
            'Ticket created successfully.';
          
          this.resetForm(false);
          void this.router.navigate([
            '/tickets/my-raised',
          ]);
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.isSubmitting = false;

          this.submissionError =
            error.error?.message ||
            'Unable to create ticket. Please try again.';
        },
      });
  }

  resetForm(
  clearFeedback = true,
): void {
  const currentUser =
    this.authService.currentUser();

  this.ticketForm.reset({
    creatorName: {
      value: currentUser?.fullName ?? '',
      disabled: true,
    },

    originatingDepartment: {
      value: currentUser?.department ?? '',
      disabled: true,
    },

    createdAt: {
      value: this.getCurrentDateTime(),
      disabled: true,
    },

    subject: '',
    categoryId: 0,
    targetDepartment: '',
    centreId: 0,
    priority: '',
    description: '',
  });

  this.selectedFiles = [];
  this.fileError = '';

  if (clearFeedback) {
    this.createdTicketId = '';
    this.submissionError = '';
    this.submissionMessage = '';
  }
}

  private isAllowedFile(file: File): boolean {
    const fileExtension = file.name
      .split('.')
      .pop()
      ?.toLowerCase();

    const allowedExtensions = [
      'pdf',
      'png',
      'jpg',
      'jpeg',
    ];

    return (
      this.allowedMimeTypes.includes(file.type) ||
      allowedExtensions.includes(fileExtension ?? '')
    );
  }

  private getCurrentDateTime(): string {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());
  }
}