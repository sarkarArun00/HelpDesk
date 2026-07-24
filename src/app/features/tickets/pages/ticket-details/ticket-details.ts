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
  EmployeeListItem,
  TicketApiService,
  TicketCommentApi,
  TicketAttachmentApi,
  TicketUpdateStatus,
} from '../../services/ticket-api.service';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';


import {
  Location,
} from '@angular/common';


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
  authorCode: string;
  message: string;
  createdBy: number;
  createdAt: string;
  replies: TicketComment[];
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
  assignedToId: number;
  assignedToPhoto: string | null;
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
  createdByPhoto: string | null;
  assigneePhoto: string | null;
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


interface TicketComment {
  id: number;
  author: string;
  authorCode: string;
  authorPhoto: string | null;
  message: string;
  createdBy: number;
  createdAt: string;
  replies: TicketComment[];
  // createdByUser: []
}




@Component({
  selector: 'app-ticket-details',
  imports: [FormsModule],
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
  
  private readonly router =
    inject(Router);
  
  private readonly location = inject(Location)
  
  get currentUserName(): string {
    return (
      this.authService.currentUser()
        ?.fullName ??
      'Current User'
    );
  }
  get currentUserProfile(): string {
    return (
      this.authService.currentUser()
        ?.employeePhoto ??
      'User Profile'
    );
  }

  pendingStatus: TicketUpdateStatus | null = null;
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

  isUpdatingStatus = false;
  statusUpdateError = '';
  statusUpdateSuccess = '';

  isReassignModalVisible = false;
  isLoadingReassignEmployees = false;
  isReassigningTicket = false;

  reassignError = '';
  reassignSuccess = '';

  selectedReassignEmployeeId = 0;
  isReassignEmployeeDropdownOpen = false;

  reassignEmployees: EmployeeListItem[] = [];

  isAddingComment = false;
  commentError = '';
  commentSuccess = '';
  
  editCategories:
    EditCategoryOption[] = [];

  editCentres:
    EditCentreOption[] = [];

  editPriorities:
    EditPriorityOption[] = [];
  
  reassignEmployeeSearch = '';

  editingCommentId: number | null = null;
  editingCommentText = '';

  updatingCommentId: number | null = null;
  deletingCommentId: number | null = null;

  commentPendingDelete:
    TicketComment | null = null;

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

  get isCurrentUserAssignee(): boolean {
    const currentUser =
      this.authService.currentUser();

    if (!currentUser) {
      return false;
    }

    const currentAssignment =
      this.ticket.assignments[0];

    return (
      currentAssignment?.assignedToId ===
      currentUser.id
    );
  }

  get isTicketCreator(): boolean {
    const currentUser =
      this.authService.currentUser();

    return Boolean(
      currentUser &&
      this.ticket.requesterId ===
      currentUser.id,
    );
  }

  private mapTicketComment(
    comment: TicketCommentApi,
  ): TicketComment {
    return {
      id:
        comment.id,

      author:
        comment.createdByUser
          ?.employee_name ??
        `Employee ${comment.created_by}`,
      authorPhoto:
        comment.createdByUser
          ?.employeePhoto ?? null,

      authorCode:
        comment.createdByUser
          ?.employee_code ??
        '',

      message:
        comment.comment,

      createdBy:
        comment.created_by,

      createdAt:
        comment.created_at,

      replies:
        (comment.replies ?? [])
          .filter(reply =>
            !reply.is_deleted,
          )
          .map(reply =>
            this.mapTicketComment(
              reply,
            ),
          )
          .sort(
            (first, second) =>
              this.getSafeTimestamp(
                first.createdAt,
              ) -
              this.getSafeTimestamp(
                second.createdAt,
              ),
          ),
    };
  }

  private getSafeTimestamp(
    date: string | null | undefined,
  ): number {
    if (!date) {
      return 0;
    }

    const timestamp =
      new Date(date).getTime();

    return Number.isNaN(timestamp)
      ? 0
      : timestamp;
  }

  locationBack() {
    this.location.back();
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
      
      comments:
        this.ticketApiService
          .getAllTicketComments(ticketId),

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

        const employeePhotoBaseUrl =
          response.ticket.base_url;
        
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
                assignedToId:
                  assignment.assigned_to,
                
                assignedTo:
                  assignment.assignedEmployee
                    ?.employee_name ??
                  assignedTo?.name ??
                  `Employee ${assignment.assigned_to}`,

                assignedToCode:
                  assignment.assignedEmployee
                    ?.employee_code ??
                  assignedTo?.code ??
                  '',

                assignedToPhoto:
                  this.resolveEmployeePhotoUrl(
                    assignment.assignedEmployee
                      ?.employeePhoto,
                    employeePhotoBaseUrl,
                  ),

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

        const ticketComments =
          response.comments.data
            .filter(comment =>
              !comment.is_deleted &&
              comment.parent_id === null,
            )
            .map(comment =>
              this.mapTicketComment(
                comment,
              ),
            )
            .sort(
              (first, second) =>
                this.getSafeTimestamp(
                  first.createdAt,
                ) -
                this.getSafeTimestamp(
                  second.createdAt,
                ),
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
          
          createdByPhoto:
            this.resolveEmployeePhotoUrl(
              apiTicket.requester
                ?.employeePhoto,
              employeePhotoBaseUrl,
            ),
          
          assigneePhoto:
            currentAssignment
              ?.assignedToPhoto ??
            null,
          
          history: activityHistory,

          priority:
            this.mapPriority(
              apiTicket.priority
                ?.priority_name,
            ),
          assignments,
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

          comments: ticketComments,


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
      createdByPhoto: null,
      assigneePhoto: null,
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
      this.isCurrentUserAssignee &&
      (
        this.ticket.status ===
        'Assigned' ||
        this.ticket.status ===
        'Reopened'
      )
    );
  }

  get canResolve(): boolean {
    return (
      this.isCurrentUserAssignee &&
      this.ticket.status ===
      'In Progress'
    );
  }

  get canConfirmResolution(): boolean {
    return (
      this.isTicketCreator &&
      this.ticket.status ===
      'Resolved'
    );
  }

  get canReassignTicket(): boolean {
    const hasReassignRole =
      this.authService.isSystemAdmin() ||
      this.authService.isDepartmentManager();

    return (
      hasReassignRole &&
      this.ticket.status === 'Assigned'
    );
  }

  openReassignModal(): void {
    if (
      !this.canReassignTicket ||
      !this.ticket.id
    ) {
      return;
    }

    this.isReassignModalVisible = true;
    this.isLoadingReassignEmployees = true;

    this.reassignError = '';
    this.reassignSuccess = '';
    this.selectedReassignEmployeeId = 0;
    this.reassignEmployees = [];

    const storedUser =
      this.authService.currentUser();

    if (!storedUser) {
      this.isLoadingReassignEmployees = false;
      this.reassignError =
        'Logged-in user information is unavailable.';

      return;
    }

    const employeeApiRole:
      'Admin' | 'Manager' =
      storedUser.role ===
        'Department Manager'
        ? 'Manager'
        : 'Admin';

    this.ticketApiService
      .getFilteredEmployeeList({
        status: true,
        // page: this.reassignEmployeePage,
        // limit: this.reassignEmployeeLimit,
        role: employeeApiRole,
      })
      .subscribe({
        next: response => {
          this.isLoadingReassignEmployees = false;

          if (!response.success) {
            this.reassignError =
              response.message ||
              'Unable to load employees.';

            return;
          }

          this.reassignEmployees =
            response.data
              .filter(employee =>
                employee.status,
              )
              .sort((first, second) =>
                first.employee_name.localeCompare(
                  second.employee_name,
                ),
              );
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.isLoadingReassignEmployees = false;

          this.reassignError =
            error.error?.message ||
            'Unable to load employees.';
        },
      });
  }

  closeReassignModal(): void {
    if (this.isReassigningTicket) {
      return;
    }

    this.isReassignModalVisible = false;
    this.selectedReassignEmployeeId = 0;
    this.reassignEmployees = [];
    this.reassignError = '';
  }

  get filteredReassignEmployees():
  EmployeeListItem[] {
  const search =
    this.reassignEmployeeSearch
      .trim()
      .toLowerCase();

  if (!search) {
    return this.reassignEmployees;
  }

  return this.reassignEmployees.filter(
    employee => {
      const departments =
        employee.departments
          .join(' ')
          .toLowerCase();

      return (
        employee.employee_name
          .toLowerCase()
          .includes(search) ||
        employee.employee_code
          .toLowerCase()
          .includes(search) ||
        departments.includes(search)
      );
    },
  );
  }
  
  openReassignEmployeeDropdown(): void {
    if (
      !this.isLoadingReassignEmployees &&
      !this.isReassigningTicket
    ) {
      this.isReassignEmployeeDropdownOpen = true;
    }
  }

  selectReassignEmployee(
    employee: EmployeeListItem,
  ): void {
    this.selectedReassignEmployeeId =
      employee.id;

    this.reassignEmployeeSearch =
      `${employee.employee_name} (${employee.employee_code})`;

    this.isReassignEmployeeDropdownOpen =
      false;
  }

  clearReassignEmployee(): void {
    this.selectedReassignEmployeeId = 0;
    this.reassignEmployeeSearch = '';
    this.isReassignEmployeeDropdownOpen =
      true;
  }

  reassignTicket(): void {
    if (
      !this.canReassignTicket ||
      !this.ticket.id ||
      !this.selectedReassignEmployeeId ||
      this.isReassigningTicket
    ) {
      return;
    }

    this.isReassigningTicket = true;
    this.reassignError = '';
    this.reassignSuccess = '';

    this.ticketApiService
      .reassignTicket(
        this.ticket.id,
        Number(
          this.selectedReassignEmployeeId,
        ),
      )
      .subscribe({
        next: response => {
          this.isReassigningTicket = false;

          if (!response.success) {
            this.reassignError =
              response.message ||
              'Unable to reassign ticket.';

            return;
          }

          this.reassignSuccess =
            response.message ||
            'Ticket reassigned successfully.';
          
          this.actionMessage =
            this.reassignSuccess;

          this.isReassignModalVisible = false;
          this.selectedReassignEmployeeId = 0;
          this.reassignEmployees = [];

          this.loadTicketDetails(
            this.ticket.id!,
          );

          this.reassignSuccess =
            response.message ||
            'Ticket reassigned successfully.';

          // void this.router.navigate([
          //   '/tickets/action-items',
          // ]);
          this.location.back();
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.isReassigningTicket = false;

          this.reassignError =
            error.error?.message ||
            'Unable to reassign ticket.';
        },
      });
  }

  startProcessing(): void {
    if (!this.canStartProcessing) {
      return;
    }

    this.updateTicketStatus(
      'IN_PROGRESS',
      'In Progress',
    );
  }

  markResolved(): void {
    if (!this.canResolve) {
      return;
    }

    this.updateTicketStatus(
      'RESOLVED',
      'Resolved',
    );
  }

  reopenTicket(): void {
    if (!this.canConfirmResolution) {
      return;
    }

    this.updateTicketStatus(
      'REOPENED',
      'Reopened',
    );
  }

  closeTicket(): void {
    if (!this.canConfirmResolution) {
      return;
    }

    this.updateTicketStatus(
      'CLOSED',
      'Closed',
    );
  }

  private updateTicketStatus(
    apiStatus: TicketUpdateStatus,
    displayStatus: TicketStatus,
  ): void {
    if (
      !this.ticket.id ||
      this.isUpdatingStatus
    ) {
      return;
    }

    this.isUpdatingStatus = true;
    this.pendingStatus = apiStatus;
    this.statusUpdateError = '';
    this.statusUpdateSuccess = '';
    this.actionMessage = '';

    this.ticketApiService
      .updateTicketStatus({
        id: this.ticket.id,
        status: apiStatus,
      })
      .subscribe({
        next: response => {
          this.isUpdatingStatus = false;
          this.pendingStatus = null;

          if (!response.success) {
            this.statusUpdateError =
              response.message ||
              'Unable to update ticket status.';

            return;
          }

          this.statusUpdateSuccess =
            response.message ||
            `Ticket status updated to ${displayStatus}.`;

          this.actionMessage =
            this.statusUpdateSuccess;

          this.loadTicketDetails(
            this.ticket.id!,
          );
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.isUpdatingStatus = false;
          this.pendingStatus = null;

          this.statusUpdateError =
            error.error?.message ||
            'Unable to update ticket status.';
        },
      });
  }

  private resolveEmployeePhotoUrl(
    employeePhoto:
      string | null | undefined,
    baseUrl:
      string | null | undefined,
  ): string | null {
    if (!employeePhoto) {
      return null;
    }

    if (
      employeePhoto.startsWith(
        'http://',
      ) ||
      employeePhoto.startsWith(
        'https://',
      )
    ) {
      return employeePhoto;
    }

    if (!baseUrl) {
      return null;
    }

    const normalizedBaseUrl =
      baseUrl.replace(
        /\/$/,
        '',
      );

    const normalizedPhotoPath =
      employeePhoto.replace(
        /^\//,
        '',
      );

    return (
      `${normalizedBaseUrl}/` +
      normalizedPhotoPath
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
    const message =
      this.newComment.trim();

    if (
      !message ||
      !this.ticket.id ||
      this.isAddingComment
    ) {
      return;
    }

    this.isAddingComment = true;
    this.commentError = '';
    this.commentSuccess = '';

    this.ticketApiService
      .createTicketComment({
        ticket_id:
          this.ticket.id,

        parent_id:
          null,

        comment:
          message,
      })
      .subscribe({
        next: response => {
          this.isAddingComment = false;

          if (!response.success) {
            this.commentError =
              response.message ||
              'Unable to add comment.';

            return;
          }

          this.newComment = '';

          this.commentSuccess =
            response.message ||
            'Comment added successfully.';

          this.actionMessage =
            this.commentSuccess;

          this.loadTicketDetails(
            this.ticket.id!,
          );
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.isAddingComment = false;

          this.commentError =
            error.error?.message ||
            'Unable to add comment.';
        },
      });
  }

  canModifyComment(
    comment: TicketComment,
  ): boolean {
    const currentUser =
      this.authService.currentUser();

    if (!currentUser) {
      return false;
    }

    const isCommentCreator =
      Number(currentUser.id) ===
      Number(comment.createdBy);

    if (!isCommentCreator) {
      return false;
    }

    const createdTime =
      new Date(
        comment.createdAt,
      ).getTime() -
      5.5 * 60 * 60 * 1000;

    if (
      Number.isNaN(createdTime)
    ) {
      return false;
    }

    const fiveMinutes =
      5 * 60 * 1000;

    return (
      Date.now() <=
      createdTime + fiveMinutes
    );
  }

  startEditingComment(
    comment: TicketComment,
  ): void {
    if (
      !this.canModifyComment(comment) ||
      this.updatingCommentId !== null ||
      this.deletingCommentId !== null
    ) {
      return;
    }

    this.editingCommentId =
      comment.id;

    this.editingCommentText =
      comment.message;

    this.commentError = '';
    this.commentSuccess = '';
  }

  cancelEditingComment(): void {
    if (
      this.updatingCommentId !== null
    ) {
      return;
    }

    this.editingCommentId = null;
    this.editingCommentText = '';
  }

  saveCommentUpdate(
    comment: TicketComment,
  ): void {
    const updatedComment =
      this.editingCommentText.trim();

    if (
      !this.canModifyComment(comment) ||
      !updatedComment ||
      this.updatingCommentId !== null
    ) {
      return;
    }

    this.updatingCommentId =
      comment.id;

    this.commentError = '';
    this.commentSuccess = '';

    this.ticketApiService
      .updateTicketComment({
        id:
          comment.id,

        comment:
          updatedComment,
      })
      .subscribe({
        next: response => {
          this.updatingCommentId =
            null;

          if (!response.success) {
            this.commentError =
              response.message ||
              'Unable to update comment.';

            return;
          }

          this.editingCommentId =
            null;

          this.editingCommentText =
            '';

          this.commentSuccess =
            response.message ||
            'Comment updated successfully.';

          this.loadTicketDetails(
            this.ticket.id!,
          );
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.updatingCommentId =
            null;

          this.commentError =
            error.error?.message ||
            'Unable to update comment.';
        },
      });
  }

  requestCommentDelete(
    comment: TicketComment,
  ): void {
    if (
      !this.canModifyComment(comment) ||
      this.deletingCommentId !== null ||
      this.updatingCommentId !== null
    ) {
      return;
    }

    this.commentPendingDelete =
      comment;

    this.commentError = '';
  }

  cancelCommentDelete(): void {
    if (
      this.deletingCommentId !== null
    ) {
      return;
    }

    this.commentPendingDelete =
      null;
  }

  confirmCommentDelete(): void {
    const comment =
      this.commentPendingDelete;

    if (
      !comment ||
      !this.canModifyComment(comment) ||
      this.deletingCommentId !== null
    ) {
      return;
    }

    this.deletingCommentId =
      comment.id;

    this.commentError = '';
    this.commentSuccess = '';

    this.ticketApiService
      .deleteTicketComment(
        comment.id,
      )
      .subscribe({
        next: response => {
          this.deletingCommentId =
            null;

          if (!response.success) {
            this.commentError =
              response.message ||
              'Unable to delete comment.';

            return;
          }

          this.commentPendingDelete =
            null;

          this.commentSuccess =
            response.message ||
            'Comment deleted successfully.';

          this.loadTicketDetails(
            this.ticket.id!,
          );
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.deletingCommentId =
            null;

          this.commentError =
            error.error?.message ||
            'Unable to delete comment.';
        },
      });
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
        timeZone:
          'Asia/Kolkata',

        day:
          '2-digit',

        month:
          'short',

        year:
          'numeric',

        hour:
          '2-digit',

        minute:
          '2-digit',

        hour12:
          true,
      },
    ).format(date);
  }

  formatCommentDate(
    dateValue:
      string | null | undefined,
  ): string {
    if (!dateValue) {
      return 'Not available';
    }

    const apiDate =
      new Date(dateValue);

    if (
      Number.isNaN(
        apiDate.getTime(),
      )
    ) {
      return 'Not available';
    }

    // Temporary fix:
    // Backend sends IST clock time marked with Z.
    const correctedDate =
      new Date(
        apiDate.getTime() -
        5.5 * 60 * 60 * 1000,
      );

    return new Intl.DateTimeFormat(
      'en-IN',
      {
        timeZone:
          'Asia/Kolkata',

        day:
          '2-digit',

        month:
          'short',

        year:
          'numeric',

        hour:
          '2-digit',

        minute:
          '2-digit',

        hour12:
          true,
      },
    ).format(correctedDate);
  }

  get canEditTicket(): boolean {
    const currentUser =
      this.authService.currentUser();

    return Boolean(
      currentUser &&
      this.ticket.requesterId &&
      currentUser.id ===
      this.ticket.requesterId &&
      this.ticket.status ===
      'Assigned',
    );
  }

  // get canEditTicket(): boolean {
  //   const currentUser =
  //     this.authService.currentUser();

  //   if (
  //     !currentUser ||
  //     !this.ticket.requesterId
  //   ) {
  //     return false;
  //   }

  //   return (
  //     currentUser.id ===
  //     this.ticket.requesterId &&
  //     this.ticket.status !== 'Closed'
  //   );
  // }

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