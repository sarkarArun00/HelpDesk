export interface TicketPriorityApi {
    id: number;
    priority_name: string;
    priority_code: string;
    priority_level: number;
    description: string;
    status: boolean;
    created_at: string;
    updated_at: string;
}

export interface GetTicketPrioritiesResponse {
    success: boolean;
    message: string;
    data: TicketPriorityApi[];
}