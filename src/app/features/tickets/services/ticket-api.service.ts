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

    requester: {
        id: number;
        employee_code: string;
        employee_name: string;
        email_id: string | null;
        employeePhoto: string | null;
    } | null;

    category_id: number;

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

    getAllTickets():
        Observable<GetTicketsResponse> {
        return this.http.get<GetTicketsResponse>(
            `${this.apiBaseUrl}/ticket/get-all`,
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
}