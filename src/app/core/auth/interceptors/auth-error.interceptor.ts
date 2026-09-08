import {
    HttpErrorResponse,
    HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
    catchError,
    throwError,
} from 'rxjs';

import {
    AuthService,
} from '../services/auth.service.js';
import {
    CustomAlertService,
} from '../services/custom-alert.service';

let isSessionExpiryHandled = false;

export const authErrorInterceptor:
    HttpInterceptorFn = (request, next) => {
        const authService =
            inject(AuthService);

        const customAlert =
            inject(CustomAlertService);

        const isAuthenticationRequest =
            request.url.includes('/auth/login') ||
            request.url.includes(
                '/auth/forgot-password',
            ) ||
            request.url.includes(
                '/auth/verify-otp',
            ) ||
            request.url.includes(
                '/auth/reset-password',
            );

        return next(request).pipe(
            catchError(
                (error: HttpErrorResponse) => {
                    if (
                        error.status === 401 &&
                        !isAuthenticationRequest &&
                        !isSessionExpiryHandled
                    ) {
                        isSessionExpiryHandled = true;

                        customAlert.show(
                            'Session Expired',
                            'Your login session has expired. Please sign in again to continue.',
                            () => {
                                authService.logout();
                            },
                        );
                    }

                    return throwError(() => error);
                },
            ),
        );
    };