export interface LoginRequest {
    employee_code: string;
    password: string;
}

export interface LoginApiResponse {
    status?: number | boolean;
    success?: boolean;
    message?: string;

    token?: string;
    accessToken?: string;
    access_token?: string;

    data?: unknown;
}