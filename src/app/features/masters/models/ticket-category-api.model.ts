export interface CreateTicketCategoryRequest {
    category_name: string;
    department_id: number;
    description: string;
    status: boolean;
}

export interface TicketCategoryDepartment {
    id: number;
    departmentName: string;
    description: string | null;
    status: string;
    hod_user: number | null;
    email: string | null;
    delete_status: boolean | null;
    createdAt: string;
    updatedAt: string;
}

export interface TicketCategory {
    id: number;
    category_name: string;
    description: string;
    status: boolean;

    department_id?: number;
    default_priority?: number;

    department:
    TicketCategoryDepartment | null;

    created_by?: number | null;
    updated_by?: number | null;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateTicketCategoryResponse {
    success: boolean;
    message: string;
    data?: TicketCategory;
}

export interface TicketCategoryPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface GetTicketCategoriesResponse {
    success: boolean;
    message: string;
    data: TicketCategory[];
    pagination: TicketCategoryPagination;
}

export interface UpdateTicketCategoryRequest {
    category_name: string;
    department_id: number;
    description: string;
    status: boolean;
}

export interface UpdateTicketCategoryResponse {
    success: boolean;
    message: string;
    data?: TicketCategory;
}