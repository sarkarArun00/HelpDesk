import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';


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
  targetDepartment: string;
  defaultPriority: TicketPriority;
}

interface Centre {
  id: number;
  name: string;
  type: 'Lab' | 'Collection Point' | 'Office';
}

@Component({
  selector: 'app-raise-ticket',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './raise-ticket.html',
  styleUrl: './raise-ticket.scss',
})
export class RaiseTicket {
  private readonly formBuilder = inject(FormBuilder);

  readonly priorities: TicketPriority[] = [
    'Critical',
    'High',
    'Medium',
    'Low',
  ];

  private readonly authService =
  inject(AuthService);

private readonly ticketStore =
  inject(TicketStoreService);

  createdTicketId = '';

submissionError = '';

  readonly categories: TicketCategory[] = [
    {
      id: 1,
      name: 'Sample Collection Delay',
      targetDepartment: 'Logistics',
      defaultPriority: 'Critical',
    },
    {
      id: 2,
      name: 'Invoice Discrepancy',
      targetDepartment: 'Accounts',
      defaultPriority: 'High',
    },
    {
      id: 3,
      name: 'Report Correction',
      targetDepartment: 'Technical',
      defaultPriority: 'Medium',
    },
    {
      id: 4,
      name: 'Reagent Requirement',
      targetDepartment: 'Laboratory',
      defaultPriority: 'High',
    },
    {
      id: 5,
      name: 'CRM Support Request',
      targetDepartment:
        'Customer Relationship Management',
      defaultPriority: 'Medium',
    },
  ];

  readonly centres: Centre[] = [
    {
      id: 1,
      name: 'Main Laboratory - Block A',
      type: 'Lab',
    },
    {
      id: 2,
      name: 'South Satellite Centre',
      type: 'Collection Point',
    },
    {
      id: 3,
      name: 'Corporate Office',
      type: 'Office',
    },
    {
      id: 4,
      name: 'New Town Collection Centre',
      type: 'Collection Point',
    },
  ];

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

  if (!currentUser) {
    this.submissionError =
      'Your login session is unavailable. Please sign in again.';

    return;
  }

  const formValue =
    this.ticketForm.getRawValue();

  const selectedCategory =
    this.categories.find(
      category =>
        category.id === formValue.categoryId,
    );

  if (!selectedCategory) {
    this.submissionError =
      'Please select a valid ticket category.';

    return;
  }

  const selectedCentre =
    this.centres.find(
      centre =>
        centre.id === formValue.centreId,
    );

  if (!selectedCentre) {
    this.submissionError =
      'Please select a valid centre or facility.';

    return;
  }

  if (!formValue.targetDepartment) {
    this.submissionError =
      'The selected category does not have a target department.';

    return;
  }

  if (!formValue.priority) {
    this.submissionError =
      'Please select a ticket priority.';

    return;
  }

  const createdTicket =
    this.ticketStore.createTicket({
      subject: formValue.subject,
      category: selectedCategory.name,
      description: formValue.description,

      priority:
        formValue.priority as TicketPriority,

      centre: selectedCentre.name,

      originatingDepartment:
        currentUser.department,

      targetDepartment:
        formValue.targetDepartment,

      createdById: currentUser.id,
      createdByName: currentUser.fullName,

      attachments: this.mapAttachments(
        this.selectedFiles,
        currentUser.fullName,
      ),
    });

  this.createdTicketId =
    createdTicket.ticketId;

  this.submissionMessage =
    `${createdTicket.ticketId} has been created successfully.`;

  this.resetForm(false);
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