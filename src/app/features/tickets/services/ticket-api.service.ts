import { HttpClient } from '@angular/common/http';
import {
    inject,
    Injectable,
} from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';


export interface CreateTicketResponse {
    success: boolean;
    message: string;
    data?: {
        id: number;
        ticket_number: string;
    };
}

export interface TicketAttachmentApi {
    id: number;
    ticket_id: number;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: string;
    uploaded_by: number;
    created_at: string;
}


export interface TicketListItem {
    id: number;
    ticket_number: string;
    subject: string;
    description: string;
    requester_id: number;
    assigned_at: string | null;
    resolved_at: string | null;
    requester: {
        id: number;
        employee_code: string;
        employee_name: string;
        email_id: string | null;
        employeePhoto: string | null;
    } | null;

    category_id: number;
    assignments?: TicketAssignmentApi[];
    category: {
        id: number;
        category_name: string;
        department_id: number;
        default_priority: number;
        description: string;
        status: boolean;
    } | null;

    department_id: number;
    centre_id: number;

    centre: {
        id: number;
        centreCode: string;
        centreName: string;
        status: boolean;
    } | null;

    priority_id: number;

    priority: {
        id: number;
        priority_name: string;
        priority_code: string;
        priority_level: number;
        description: string;
        status: boolean;
    } | null;

    status: string;
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
    attachments: TicketAttachmentApi[];
    is_deleted: boolean;
}

export interface GetTicketsResponse {
    success: boolean;
    message: string;
    total: number;
    data: TicketListItem[];
}

export interface GetTicketDetailsResponse {
    success: boolean;
    message: string;
    data: TicketListItem;
}

export interface UpdateTicketPayload {
    id: number;
    subject: string;
    description: string;
    category_id: number;
    department_id: number;
    centre_id: number;
    priority_id: number;
    status: 'Assign';
}

export interface UpdateTicketResponse {
    success: boolean;
    message: string;
    data?: TicketListItem;
}

export interface EmployeeListItem {
    id: number;
    employee_code: string;
    employee_name: string;
    email_id: string | null;
    user_name: string;
    employeePhoto: string | null;
    user_type: string;
    status: boolean;
    departments: string[];
}

export interface GetEmployeeListResponse {
    success: boolean;
    message: string;
    data: EmployeeListItem[];
}

export interface UpdateEmployeePayload {
    id: number;
    user_type: string;
    is_active: boolean;
}

export interface UpdateEmployeeResponse {
    success: boolean;
    message: string;
    data?: EmployeeListItem;
}

export type TicketListType =
    | 'created'
    | 'assigned';

export interface GetTicketsPayload {
    type?: TicketListType;
}

export interface TicketAssignmentApi {
    id: number;
    ticket_id: number;
    assigned_to: number;

    assignedEmployee: {
        id: number;
        employee_code: string;
        employee_name: string;
        email_id: string | null;
        user_name: string;
        status: string;
        employeePhoto: string | null;
        delete_status:
        string | boolean | null;
        createdAt: string;
        updatedAt: string;
    } | null;

    assigned_by: number;
    department_id: number;
    assignment_type: string;
    status: string;
    assigned_at: string;
    created_at: string;
    updated_at: string;
}

export interface TicketActivityLog {
    id: number;
    category: string;
    ticketId: number;
    entityType: string | null;
    entityId: number | null;
    userId: number;
    userName: string;
    activityType: string;
    message: string;
    metaData:
    Record<string, unknown> | null;
    createdAt: string;
}

export interface GetTicketActivityLogsResponse {
    success: boolean;
    message: string;
    data: TicketActivityLog[];
}

export type TicketUpdateStatus =
    | 'IN_PROGRESS'
    | 'RESOLVED'
    | 'REOPENED'
    | 'CLOSED';

export interface UpdateTicketStatusResponse {
    success: boolean;
    message: string;
    data?: TicketListItem;
}

export interface ReassignTicketResponse {
    success: boolean;
    message: string;
    data?: TicketListItem;
}


export type EmployeeListRole =
    | 'Admin'
    | 'Manager';

export interface EmployeeListParams {
    status: boolean;
    // page: number;
    // limit: number;
    role: EmployeeListRole;
}

export interface CreateTicketCommentPayload {
    ticket_id: number;
    parent_id: number | null;
    comment: string;
}

export interface DeleteTicketCommentPayload {
    id: number;
}

export interface TicketCommentUserApi {
    id: number;
    employee_code: string;
    employee_name: string;
    email_id: string | null;
    user_name: string;
    status: string;
    employeePhoto: string | null;
    delete_status: boolean | null;
    createdAt: string;
    updatedAt: string;
}

export interface TicketCommentApi {
    id: number;
    ticket_id: number;
    parent_id: number | null;
    replies: TicketCommentApi[];
    comment: string;
    created_by: number;
    createdByUser:
    TicketCommentUserApi | null;
    updated_by: number | null;
    is_internal: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface GetTicketCommentsResponse {
    success: boolean;
    message?: string;
    data: TicketCommentApi[];
}

export interface TicketCommentActionResponse {
    success: boolean;
    message: string;
    data?: TicketCommentApi;
}

export interface UpdateTicketCommentPayload {
    id: number;
    comment: string;
}

export type TicketSummaryDateFilter =
    | '7-DAYS'
    | '15-DAYS'
    | '1-MONTH'
    | '3-MONTH'
    | '6-MONTH'
    | 'ALL';

export interface TicketSummaryPayload {
    dateFilter:
    TicketSummaryDateFilter;

    department_id:
    number | null;

    category_id:
    number | null;

    centre_id:
    number | null;

    priority_id:
    number | null;
}


export interface TicketSummaryData {
    totalTickets: number;
    openTickets: number;
    assignedTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    awaitingConfirmationTickets: number;
    raisedByMeTickets: number;
    assignedToMeTickets: number;
}

export interface TicketSummaryResponse {
    success: boolean;
    message: string;
    data: TicketSummaryData;
}

export interface GetTicketDetailsResponse {
    success: boolean;
    message: string;
    data: TicketListItem;
    base_url: string;
}

@Injectable({
    providedIn: 'root',
})
export class TicketApiService {
    private readonly http =
        inject(HttpClient);

    private readonly apiBaseUrl =
        environment.apiBaseUrl;

    createTicket(
        formData: FormData,
    ): Observable<CreateTicketResponse> {
        return this.http.post<CreateTicketResponse>(
            `${this.apiBaseUrl}/ticket/create`,
            formData,
        );
    }

    getAllTickets(
        payload: GetTicketsPayload = {},
    ): Observable<GetTicketsResponse> {
        return this.http.post<GetTicketsResponse>(
            `${this.apiBaseUrl}/ticket/get-all`,
            payload,
        );
    }

    getTicketDetails(
        ticketId: number,
    ): Observable<GetTicketDetailsResponse> {
        return this.http.get<GetTicketDetailsResponse>(
            `${this.apiBaseUrl}/ticket/details/${ticketId}`,
        );
    }

    updateTicket(
        payload: UpdateTicketPayload,
    ): Observable<UpdateTicketResponse> {
        return this.http.post<UpdateTicketResponse>(
            `${this.apiBaseUrl}/ticket/update`,
            payload,
        );
    }

    getEmployeeList():
        Observable<GetEmployeeListResponse> {
        return this.http.get<GetEmployeeListResponse>(
            `${this.apiBaseUrl}/employee/get-employee-list`,
        );
    }

    updateEmployee(
        payload: UpdateEmployeePayload,
    ): Observable<UpdateEmployeeResponse> {
        return this.http.post<UpdateEmployeeResponse>(
            `${this.apiBaseUrl}/employee/update-employee`,
            payload,
        );
    }

    getTicketActivityLogs(
        ticketId: number,
    ): Observable<GetTicketActivityLogsResponse> {
        return this.http.get<GetTicketActivityLogsResponse>(
            `${this.apiBaseUrl}/activity-log/ticket/${ticketId}`,
        );
    }

    updateTicketStatus(
        payload: {
            id: number;
            status: TicketUpdateStatus;
        },
    ): Observable<UpdateTicketStatusResponse> {
        return this.http.post<UpdateTicketStatusResponse>(
            `${this.apiBaseUrl}/ticket/update`,
            payload,
        );
    }

    reassignTicket(
        ticketId: number,
        assignedToId: number,
    ): Observable<ReassignTicketResponse> {
        return this.http.post<ReassignTicketResponse>(
            `${this.apiBaseUrl}/ticket/update`,
            {
                id: ticketId,
                status: 'ASSIGNED',
                assigned_to_id: assignedToId,
            },
        );
    }

    getFilteredEmployeeList(
        params: EmployeeListParams,
    ): Observable<GetEmployeeListResponse> {
        return this.http.get<GetEmployeeListResponse>(
            `${this.apiBaseUrl}/employee/get-employee-list`,
            {
                params: {
                    status: params.status,
                    // page: params.page,
                    // limit: params.limit,
                    role: params.role,
                },
            },
        );
    }

    createTicketComment(
        payload: CreateTicketCommentPayload,
    ): Observable<TicketCommentActionResponse> {
        return this.http.post<TicketCommentActionResponse>(
            `${this.apiBaseUrl}/ticket/comment/create`,
            payload,
        );
    }

    getAllTicketComments(
        ticketId: number,
    ): Observable<GetTicketCommentsResponse> {
        return this.http.post<GetTicketCommentsResponse>(
            `${this.apiBaseUrl}/ticket/comment/get-all`,
            {
                ticket_id: ticketId,
            },
        );
    }

    deleteTicketComment(
        commentId: number,
    ): Observable<TicketCommentActionResponse> {
        return this.http.post<TicketCommentActionResponse>(
            `${this.apiBaseUrl}/ticket/comment/delete`,
            {
                id: commentId,
            },
        );
    }

    updateTicketComment(
        payload: UpdateTicketCommentPayload,
    ): Observable<TicketCommentActionResponse> {
        return this.http.post<TicketCommentActionResponse>(
            `${this.apiBaseUrl}/ticket/comment/update`,
            payload,
        );
    }

    getTicketSummaryData(
        payload: TicketSummaryPayload,
    ): Observable<TicketSummaryResponse> {
        return this.http.post<TicketSummaryResponse>(
            `${this.apiBaseUrl}/ticket/get-summary-data`,
            payload,
        );
    }
    
}