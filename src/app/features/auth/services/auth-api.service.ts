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
}