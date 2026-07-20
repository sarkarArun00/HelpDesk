import {
    Injectable,
    inject,
} from '@angular/core';
import {
    HttpClient,
} from '@angular/common/http';
import {
    Observable,
} from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
    LoginApiResponse,
    LoginRequest,
} from '../models/login-api.model';

@Injectable({
    providedIn: 'root',
})
export class AuthApiService {
    private readonly http =
        inject(HttpClient);

    private readonly baseUrl =
        environment.apiBaseUrl;

    login(
        payload: LoginRequest,
    ): Observable<LoginApiResponse> {
        return this.http.post<LoginApiResponse>(
            `${this.baseUrl}/auth/login`,
            payload,
        );
    }
}