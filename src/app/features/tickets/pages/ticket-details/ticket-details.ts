import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { environment } from '../../../../../environments/environment.js';
import { TicketCategoryApiService } from '../../../masters/services/ticket-category-api.service';
import {
  TicketApiService,
  TicketAttachmentApi,
} from '../../services/ticket-api.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';


type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

interface EditCategoryOption {
  id: number;
  name: string;
  departmentId: number;
  departmentName: string;
}

interface EditCentreOption {
  id: number;
  code: string;
  name: string;
}

interface EditPriorityOption {
  id: number;
  name: string;
}

type TicketStatus =
  | 'Open'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Reopened';

interface TicketAttachment {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
}

interface TicketComment {
  id: number;
  author: string;
  department: string;
  message: string;
  createdAt: string;
}

interface TicketHistory {
  id: number;
  title: string;
  description: string;
  performedBy: string;
  createdAt: string;
  type:
    | 'created'
    | 'assigned'
    | 'progress'
    | 'resolved'
    | 'closed'
    | 'reopened'
    | 'comment';
}

interface TicketAssignmentDetail {
  id: number;
  assignedTo: string;
  assignedToCode: string;
  assignedBy: string;
  department: string;
  assignmentType: string;
  status: string;
  assignedAt: string;
}

interface TicketDetail {
  id?: number;
  requesterId?: number;
  categoryId?: number;
  departmentId?: number;
  centreId?: number;
  priorityId?: number;
  ticketId: string;
  subject: string;
  category: string;
  description: string;
  priority: TicketPriority;
  assignments:
  TicketAssignmentDetail[];
  status: TicketStatus;
  createdBy: string;
  originatingDepartment: string;
  targetDepartment: string;
  centre: string;
  assignee: string;
  assigneeCode: string;
  createdAt: string;
  updatedAt: string;
  attachments: TicketAttachment[];
  comments: TicketComment[];
  history: TicketHistory[];
}



@Component({
  selector: 'app-ticket-details',
  imports: [FormsModule, RouterLink],
  templateUrl: './ticket-details.html',
  styleUrl: './ticket-details.scss',
})
export class TicketDetails implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly authService =
    inject(AuthService);

  private readonly ticketApiService =
    inject(TicketApiService);

  private readonly ticketCategoryApiService =
    inject(TicketCategoryApiService);
  
  get currentUserName(): string {
    return (
      this.authService.currentUser()
        ?.fullName ??
      'Current User'
    );
  }

  ticket: TicketDetail =
    this.createEmptyTicket();

  newComment = '';

  actionMessage = '';

  isLoading = false;

  loadError = '';

  isEditModalVisible = false;

  isLoadingEditMasters = false;

  isUpdatingTicket = false;

  editError = '';

  editCategories:
    EditCategoryOption[] = [];

  editCentres:
    EditCentreOption[] = [];

  editPriorities:
    EditPriorityOption[] = [];

  editTicketForm = {
    subject: '',
    description: '',
    categoryId: 0,
    departmentId: 0,
    departmentName: '',
    centreId: 0,
    priorityId: 0,
  };

  ngOnInit(): void {
    const routeTicketId =
      Number(
        this.activatedRoute.snapshot
          .paramMap.get('ticketId'),
      );

    if (!routeTicketId) {
      this.loadError =
        'Invalid ticket ID.';

      return;
    }

    this.loadTicketDetails(
      routeTicketId,
    );
  }

  private getActivityTitle(
    activityType: string,
  ): string {
    switch (
    activityType
      ?.trim()
      .toUpperCase()
    ) {
      case 'CREATE':
        return 'Ticket created';

      case 'ASSIGN':
      case 'ASSIGNED':
        return 'Ticket assigned';

      case 'START':
      case 'IN_PROGRESS':
        return 'Processing started';

      case 'RESOLVE':
      case 'RESOLVED':
        return 'Ticket resolved';

      case 'CLOSE':
      case 'CLOSED':
        return 'Ticket closed';

      case 'REOPEN':
      case 'REOPENED':
        return 'Ticket reopened';

      case 'COMMENT':
        return 'Comment added';

      case 'UPDATE':
        return 'Ticket updated';

      default:
        return activityType
          ? activityType
            .replaceAll('_', ' ')
            .toLowerCase()
            .replace(
              /^./,
              character =>
                character.toUpperCase(),
            )
          : 'Ticket activity';
    }
  }

  private mapActivityType(
    activityType: string,
  ): TicketHistory['type'] {
    switch (
    activityType
      ?.trim()
      .toUpperCase()
    ) {
      case 'CREATE':
        return 'created';

      case 'ASSIGN':
      case 'ASSIGNED':
        return 'assigned';

      case 'RESOLVE':
      case 'RESOLVED':
        return 'resolved';

      case 'CLOSE':
      case 'CLOSED':
        return 'closed';

      case 'REOPEN':
      case 'REOPENED':
        return 'reopened';

      case 'COMMENT':
        return 'comment';

      default:
        return 'progress';
    }
  }

  loadTicketDetails(
    ticketId: number,
  ): void {
    this.isLoading = true;
    this.loadError = '';

    forkJoin({
      ticket:
        this.ticketApiService
          .getTicketDetails(ticketId),

      departments:
        this.ticketCategoryApiService
          .getAllDepartments(),

      employees:
        this.ticketApiService
          .getEmployeeList(),

      activity:
        this.ticketApiService
          .getTicketActivityLogs(
            ticketId,
          ),
    }).subscribe({
      next: response => {
        this.isLoading = false;

        if (
          !response.ticket.success ||
          !response.departments.success
        ) {
          this.loadError =
            'Unable to load ticket details.';

          return;
        }

        const apiTicket =
          response.ticket.data;
        const employeeById =
          new Map<
            number,
            {
              name: string;
              code: string;
            }
          >();

        response.employees.data
          .forEach(employee => {
            employeeById.set(
              employee.id,
              {
                name:
                  employee.employee_name,
                code:
                  employee.employee_code,
              },
            );
          });

        const departmentById =
          new Map<number, string>();

        response.departments.data
          .forEach(department => {
            departmentById.set(
              department.id,
              department.departmentName,
            );
          });

        const assignments =
          (apiTicket.assignments ?? [])
            .map(assignment => {
              const assignedTo =
                employeeById.get(
                  assignment.assigned_to,
                );

              const assignedBy =
                employeeById.get(
                  assignment.assigned_by,
                );

              return {
                id: assignment.id,

                assignedTo:
                  assignedTo?.name ??
                  `Employee ${assignment.assigned_to}`,

                assignedToCode:
                  assignedTo?.code ?? '',

                assignedBy:
                  assignedBy?.name ??
                  `Employee ${assignment.assigned_by}`,

                department:
                  departmentById.get(
                    assignment.department_id,
                  ) ??
                  `Department ${assignment.department_id}`,

                assignmentType:
                  assignment.assignment_type,

                status:
                  assignment.status,

                assignedAt:
                  assignment.assigned_at,
              };
            })
            .sort(
              (first, second) =>
                new Date(
                  second.assignedAt,
                ).getTime() -
                new Date(
                  first.assignedAt,
                ).getTime(),
            );

        const currentAssignment =
          assignments[0] ?? null;
        
        const activityHistory:
          TicketHistory[] =
          response.activity.data
            .map(activity => ({
              id: activity.id,

              title:
                this.getActivityTitle(
                  activity.activityType,
                ),

              description:
                activity.message,

              performedBy:
                activity.userName ||
                `User ${activity.userId}`,

              createdAt:
                activity.createdAt,

              type:
                this.mapActivityType(
                  activity.activityType,
                ),
            }))
            .sort(
              (first, second) =>
                new Date(
                  second.createdAt,
                ).getTime() -
                new Date(
                  first.createdAt,
                ).getTime(),
            );

        const targetDepartment =
          response.departments.data.find(
            department =>
              department.id ===
              apiTicket.department_id,
          );

        this.ticket = {
          ticketId:
            apiTicket.ticket_number,

          subject:
            apiTicket.subject,

          category:
            apiTicket.category
              ?.category_name ??
            'Not available',

          description:
            apiTicket.description,
          
          history: activityHistory,

          priority:
            this.mapPriority(
              apiTicket.priority
                ?.priority_name,
            ),
          assignments: [],
          status:
            this.mapStatus(
              apiTicket.status,
            ),

          createdBy:
            apiTicket.requester
              ?.employee_name ??
            'Not available',

          originatingDepartment:
            'Not available',

          targetDepartment:
            targetDepartment
              ?.departmentName ??
            `Department ${apiTicket.department_id}`,

          centre:
            apiTicket.centre
              ?.centreName ??
            'Not available',

          // Assignee is not included
          // in the current response.
          assignee:
            currentAssignment
              ?.assignedTo ??
            'Not assigned',

          assigneeCode:
            currentAssignment
              ?.assignedToCode ?? '',

          createdAt:
            apiTicket.created_at,

          updatedAt:
            apiTicket.updated_at,

          attachments:
            apiTicket.attachments.map(
              attachment =>
                this.mapAttachment(
                  attachment,
                  apiTicket.requester
                    ?.employee_name ??
                  'Not available',
                ),
            ),

          comments: [],


          id: apiTicket.id,

          requesterId:
            apiTicket.requester_id,

          categoryId:
            apiTicket.category_id,

          departmentId:
            apiTicket.department_id,

          centreId:
            apiTicket.centre_id,

          priorityId:
            apiTicket.priority_id,
        };
      },

      error: (
        error: HttpErrorResponse,
      ) => {
        this.isLoading = false;

        this.loadError =
          error.error?.message ||
          'Unable to load ticket details.';
      },
    });
  }

  private mapAttachment(
    attachment: TicketAttachmentApi,
    uploadedBy: string,
  ): TicketAttachment {
    const filePath =
      attachment.file_path
        .replace(/^\//, '');

    return {
      id: attachment.id,
      name: attachment.file_name,
      type:
        attachment.file_type,
      size:
        this.formatFileSize(
          Number(
            attachment.file_size,
          ),
        ),
      uploadedBy,
      uploadedAt:
        attachment.created_at,
      url:
        `${environment.apiBaseUrl}/${filePath}`,
    };
  }

  private formatFileSize(
    sizeInBytes: number,
  ): string {
    if (
      !Number.isFinite(sizeInBytes) ||
      sizeInBytes <= 0
    ) {
      return 'Unknown size';
    }

    if (sizeInBytes < 1024 * 1024) {
      return `${(
        sizeInBytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      sizeInBytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  private mapPriority(
    priority:
      string | null | undefined,
  ): TicketPriority {
    const allowed:
      TicketPriority[] = [
        'Critical',
        'High',
        'Medium',
        'Low',
      ];

    return allowed.includes(
      priority as TicketPriority,
    )
      ? priority as TicketPriority
      : 'Medium';
  }

  private mapStatus(
    status:
      string | null | undefined,
  ): TicketStatus {
    switch (
    status
      ?.trim()
      .toUpperCase()
    ) {
      case 'OPEN':
        return 'Open';

      case 'ASSIGNED':
        return 'Assigned';

      case 'IN_PROGRESS':
      case 'IN PROGRESS':
        return 'In Progress';

      case 'RESOLVED':
        return 'Resolved';

      case 'CLOSED':
        return 'Closed';

      case 'REOPENED':
        return 'Reopened';

      default:
        return 'Open';
    }
  }

  private createEmptyTicket():
    TicketDetail {
    return {
      
      ticketId: '',
      subject: '',
      category: '',
      description: '',
      priority: 'Low',
      status: 'Open',
      createdBy: '',
      assignments: [],
      originatingDepartment: '',
      targetDepartment: '',
      centre: '',
      assignee: '',
      assigneeCode: '',
      createdAt: '',
      updatedAt: '',
      attachments: [],
      comments: [],
      history: [],
    };
  }

  get canStartProcessing(): boolean {
    return (
      this.ticket.status === 'Assigned' ||
      this.ticket.status === 'Reopened'
    );
  }

  get canResolve(): boolean {
    return this.ticket.status === 'In Progress';
  }

  get canConfirmResolution(): boolean {
    return this.ticket.status === 'Resolved';
  }

  startProcessing(): void {
    this.updateTicketStatus(
      'In Progress',
      'Ticket processing started',
      'The assigned employee started working on the ticket.',
      'progress',
    );
  }

  markResolved(): void {
    this.updateTicketStatus(
      'Resolved',
      'Ticket marked as resolved',
      'The assigned employee submitted the ticket resolution.',
      'resolved',
    );
  }

  closeTicket(): void {
    this.updateTicketStatus(
      'Closed',
      'Resolution confirmed and ticket closed',
      'The ticket creator confirmed the submitted resolution.',
      'closed',
    );
  }

  reopenTicket(): void {
    this.updateTicketStatus(
      'Reopened',
      'Ticket reopened',
      'The ticket creator rejected the resolution and reopened the ticket.',
      'reopened',
    );
  }

  openEditModal(): void {
    if (!this.canEditTicket) {
      return;
    }

    this.editError = '';

    this.editTicketForm = {
      subject:
        this.ticket.subject,
      description:
        this.ticket.description,
      categoryId:
        this.ticket.categoryId ?? 0,
      departmentId:
        this.ticket.departmentId ?? 0,
      departmentName:
        this.ticket.targetDepartment,
      centreId:
        this.ticket.centreId ?? 0,
      priorityId:
        this.ticket.priorityId ?? 0,
    };

    this.isEditModalVisible = true;

    this.loadEditMasters();
  }

  closeEditModal(): void {
    if (this.isUpdatingTicket) {
      return;
    }

    this.isEditModalVisible = false;
    this.editError = '';
  }

  loadEditMasters(): void {
    this.isLoadingEditMasters = true;
    this.editError = '';

    forkJoin({
      categories:
        this.ticketCategoryApiService
          .getAllCategories(1, 100),

      departments:
        this.ticketCategoryApiService
          .getAllDepartments(),

      priorities:
        this.ticketCategoryApiService
          .getAllPriorities(),

      centres:
        this.ticketCategoryApiService
          .getAllCentres(),
    }).subscribe({
      next: response => {
        this.isLoadingEditMasters = false;

        if (
          !response.categories.success ||
          !response.departments.success ||
          !response.priorities.success ||
          !response.centres.success
        ) {
          this.editError =
            'Unable to load edit form data.';

          return;
        }

        const departmentNameById =
          new Map<number, string>();

        response.departments.data
          .forEach(department => {
            departmentNameById.set(
              department.id,
              department.departmentName,
            );
          });

        this.editCategories =
          response.categories.data
            .filter(category =>
              Boolean(category.status),
            )
            .map(category => {
              const departmentId =
                category.department?.id ??
                category.department_id ??
                0;

              return {
                id: category.id,
                name:
                  category.category_name,
                departmentId,
                departmentName:
                  category.department
                    ?.departmentName ??
                  departmentNameById.get(
                    departmentId,
                  ) ??
                  `Department ${departmentId}`,
              };
            })
            .sort((first, second) =>
              first.name.localeCompare(
                second.name,
              ),
            );

        this.editPriorities =
          response.priorities.data
            .filter(priority =>
              Boolean(priority.status),
            )
            .sort(
              (first, second) =>
                second.priority_level -
                first.priority_level,
            )
            .map(priority => ({
              id: priority.id,
              name:
                priority.priority_name,
            }));

        this.editCentres =
          response.centres.data
            .map(centre => ({
              id: centre.id,
              code:
                centre.centreCode,
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
        this.isLoadingEditMasters = false;

        this.editError =
          error.error?.message ||
          'Unable to load edit form data.';
      },
    });
  }

  updateTicket(): void {
    this.editError = '';

    if (!this.canEditTicket) {
      this.editError =
        'You are not allowed to edit this ticket.';

      return;
    }

    const ticketId =
      this.ticket.id;

    const subject =
      this.editTicketForm.subject.trim();

    const description =
      this.editTicketForm
        .description.trim();

    if (!ticketId) {
      this.editError =
        'Invalid ticket ID.';

      return;
    }

    if (subject.length < 5) {
      this.editError =
        'Subject must contain at least 5 characters.';

      return;
    }

    if (description.length < 20) {
      this.editError =
        'Description must contain at least 20 characters.';

      return;
    }

    if (
      !this.editTicketForm.categoryId ||
      !this.editTicketForm.departmentId ||
      !this.editTicketForm.centreId ||
      !this.editTicketForm.priorityId
    ) {
      this.editError =
        'Please complete all required fields.';

      return;
    }

    this.isUpdatingTicket = true;

    this.ticketApiService
      .updateTicket({
        id: ticketId,
        subject,
        description,
        category_id:
          this.editTicketForm.categoryId,
        department_id:
          this.editTicketForm.departmentId,
        centre_id:
          this.editTicketForm.centreId,
        priority_id:
          this.editTicketForm.priorityId,
        status: 'Assign',
      })
      .subscribe({
        next: response => {
          this.isUpdatingTicket = false;

          if (!response.success) {
            this.editError =
              response.message ||
              'Unable to update ticket.';

            return;
          }

          this.isEditModalVisible =
            false;

          this.actionMessage =
            response.message ||
            'Ticket updated successfully.';

          this.loadTicketDetails(
            ticketId,
          );
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.isUpdatingTicket = false;

          this.editError =
            error.error?.message ||
            'Unable to update ticket. Please try again.';
        },
      });
  }

  onEditCategoryChange(
    categoryId: number,
  ): void {
    const selectedCategory =
      this.editCategories.find(
        category =>
          category.id === categoryId,
      );

    this.editTicketForm.departmentId =
      selectedCategory?.departmentId ??
      0;

    this.editTicketForm.departmentName =
      selectedCategory
        ?.departmentName ?? '';
  }

  addComment(): void {
    const message = this.newComment.trim();

    if (!message) {
      return;
    }

    const createdAt = new Date().toISOString();

    this.ticket.comments = [
      ...this.ticket.comments,
      {
        id: Date.now(),
        author: this.currentUserName,
        department: 'Information Technology',
        message,
        createdAt,
      },
    ];

    this.ticket.history = [
      {
        id: Date.now() + 1,
        title: 'Comment added',
        description: message,
        performedBy: this.currentUserName,
        createdAt,
        type: 'comment',
      },
      ...this.ticket.history,
    ];

    this.ticket.updatedAt = createdAt;
    this.newComment = '';
    this.actionMessage = 'Your comment has been added successfully.';
  }

  getPriorityClass(priority: TicketPriority): string {
    return `priority-${priority.toLowerCase()}`;
  }

  getStatusClass(status: TicketStatus): string {
    return `status-${status
      .toLowerCase()
      .replaceAll(' ', '-')}`;
  }

  getHistoryIcon(type: TicketHistory['type']): string {
    const icons: Record<TicketHistory['type'], string> = {
      created: 'bi-plus-circle',
      assigned: 'bi-person-check',
      progress: 'bi-play-circle',
      resolved: 'bi-check-circle',
      closed: 'bi-lock',
      reopened: 'bi-arrow-counterclockwise',
      comment: 'bi-chat-left-text',
    };

    return icons[type];
  }

  getInitials(fullName: string): string {
    if (!fullName?.trim()) {
      return '--';
    }

    return fullName
      .trim()
      .split(/\s+/)
      .map(namePart => namePart.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
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

  private updateTicketStatus(
    status: TicketStatus,
    title: string,
    description: string,
    historyType: TicketHistory['type'],
  ): void {
    const updatedAt = new Date().toISOString();

    this.ticket.status = status;
    this.ticket.updatedAt = updatedAt;

    this.ticket.history = [
      {
        id: Date.now(),
        title,
        description,
        performedBy: this.currentUserName,
        createdAt: updatedAt,
        type: historyType,
      },
      ...this.ticket.history,
    ];

    this.actionMessage = `${this.ticket.ticketId} status updated to ${status}.`;
  }

  get canEditTicket(): boolean {
    const currentUser =
      this.authService.currentUser();

    if (
      !currentUser ||
      !this.ticket.requesterId
    ) {
      return false;
    }

    return (
      currentUser.id ===
      this.ticket.requesterId &&
      this.ticket.status !== 'Closed'
    );
  }

  downloadAttachment(
    attachment: TicketAttachment,
  ): void {
    if (!attachment.url) {
      this.actionMessage =
        'Attachment URL is unavailable.';

      return;
    }

    window.open(
      attachment.url,
      '_blank',
      'noopener,noreferrer',
    );
  }


}