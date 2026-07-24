import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
    ChangePasswordRequest,
    ChangePasswordResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginApiResponse,
    LoginRequest,
    ResetPasswordRequest,
    ResetPasswordResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
} from '../models/login-api.model';



export interface SaveDeviceTokenPayload {
    token: string;
    device_type: 'web';
}

export interface SaveDeviceTokenResponse {
    success: boolean;
    message: string;
}



@Injectable({
    providedIn: 'root',
})
    
    
export class AuthApiService {
    private readonly http = inject(HttpClient);

    private readonly apiBaseUrl =
        environment.apiBaseUrl;

    login(
        payload: LoginRequest,
    ): Observable<LoginApiResponse> {
        return this.http.post<LoginApiResponse>(
            `${this.apiBaseUrl}/auth/login`,
            payload,
        );
    }

    forgotPassword(
        payload: ForgotPasswordRequest,
    ): Observable<ForgotPasswordResponse> {
        return this.http.post<ForgotPasswordResponse>(
            `${this.apiBaseUrl}/auth/forgot-password`,
            payload,
        );
    }

    verifyOtp(
        payload: VerifyOtpRequest,
    ): Observable<VerifyOtpResponse> {
        return this.http.post<VerifyOtpResponse>(
            `${this.apiBaseUrl}/auth/verify-otp`,
            payload,
        );
    }

    changePassword(
        payload: ChangePasswordRequest,
    ): Observable<ChangePasswordResponse> {
        return this.http.post<ChangePasswordResponse>(
            `${this.apiBaseUrl}/auth/change-password`,
            payload,
        );
    }

    resetPassword(
        payload: ResetPasswordRequest,
    ): Observable<ResetPasswordResponse> {
        return this.http.post<ResetPasswordResponse>(
            `${this.apiBaseUrl}/auth/reset-password`,
            payload,
        );
    }

    saveDeviceToken(
        payload: SaveDeviceTokenPayload,
    ): Observable<SaveDeviceTokenResponse> {
        return this.http.post<SaveDeviceTokenResponse>(
            `${this.apiBaseUrl}/employee/save-device-token`,
            payload,
        );
    }

    getProfile(): Observable<{
        success: boolean;
        message: string;
        data: {
            id: number;
            employee_code: string;
            employee_name: string;
            email_id: string | null;
            user_name: string;
            employeePhoto: string | null;
            user_type: string;
            deparments: string[];
        };
    }> {
        return this.http.get<{
            success: boolean;
            message: string;
            data: {
                id: number;
                employee_code: string;
                employee_name: string;
                email_id: string | null;
                user_name: string;
                employeePhoto: string | null;
                user_type: string;
                deparments: string[];
            };
        }>(
            `${this.apiBaseUrl}/auth/profile`,
        );
    }
}