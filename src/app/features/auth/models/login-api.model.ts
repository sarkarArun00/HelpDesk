export interface ResetPasswordRequest {
    reset_token: string;
    new_password: string;
}

export interface ResetPasswordResponse {
    success: boolean;
    message: string;
}
export interface LoginRequest {
    employee_code: string;
    password: string;
}

export interface LoginEmployee {
    id: number;
    employee_code: string;
    employee_name: string;
}

export interface LoginApiResponse {
    success: boolean;
    message: string;
    access_token: string;
    employee: LoginEmployee;
}

export interface ForgotPasswordRequest {
    employee_code: string;
}

export interface ForgotPasswordResponse {
    success: boolean;
    message: string;
}

export interface VerifyOtpRequest {
    employee_code: string;
    otp: number;
}

export interface VerifyOtpResponse {
    success: boolean;
    message: string;
    reset_token?: string;
    token?: string;
}

export interface ChangePasswordRequest {
    employeeCode: string;
    oldPassword: string;
    newPassword: string;
}

export interface ChangePasswordResponse {
    success: boolean;
    message: string;
}