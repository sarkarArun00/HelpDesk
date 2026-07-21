import {
    HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

export const authInterceptor:
    HttpInterceptorFn = (
        request,
        next,
    ) => {
        const authService =
            inject(AuthService);

        const accessToken =
            authService.getAccessToken();

        if (!accessToken) {
            return next(request);
        }

        const authenticatedRequest =
            request.clone({
                setHeaders: {
                    Authorization:
                        `Bearer ${accessToken}`,
                },
            });

        return next(authenticatedRequest);
    };