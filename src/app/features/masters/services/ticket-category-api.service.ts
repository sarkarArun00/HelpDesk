import {
    HttpClient,
    HttpParams,
} from '@angular/common/http';
import {
    inject,
    Injectable,
} from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
    CreateTicketCategoryRequest,
    CreateTicketCategoryResponse,
    GetTicketCategoriesResponse,
    UpdateTicketCategoryRequest,
    UpdateTicketCategoryResponse,
} from '../models/ticket-category-api.model';
import { GetTicketPrioritiesResponse } from '../models/ticket-priority-api.model';
import { GetDepartmentsResponse } from '../models/department-api.model';
import { GetCentresResponse } from '../models/centre-api.model';


@Injectable({
    providedIn: 'root',
})
export class TicketCategoryApiService {
    private readonly http =
        inject(HttpClient);

    private readonly apiBaseUrl =
        environment.apiBaseUrl;

    createCategory(
        payload: CreateTicketCategoryRequest,
    ): Observable<CreateTicketCategoryResponse> {
        return this.http.post<CreateTicketCategoryResponse>(
            `${this.apiBaseUrl}/ticket-category/create`,
            payload,
        );
    }

    getAllCategories(
        page = 1,
        limit = 10,
    ): Observable<GetTicketCategoriesResponse> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        return this.http.get<GetTicketCategoriesResponse>(
            `${this.apiBaseUrl}/ticket-category/get-all`,
            { params },
        );
    }

    updateCategory(
        categoryId: number,
        payload: UpdateTicketCategoryRequest,
    ): Observable<UpdateTicketCategoryResponse> {
        return this.http.put<UpdateTicketCategoryResponse>(
            `${this.apiBaseUrl}/ticket-category/update/${categoryId}`,
            payload,
        );
    }

    getAllPriorities():
        Observable<GetTicketPrioritiesResponse> {
        return this.http.get<GetTicketPrioritiesResponse>(
            `${this.apiBaseUrl}/ticket-priority/get-all`,
        );
    }

    getAllDepartments():
        Observable<GetDepartmentsResponse> {
        return this.http.get<GetDepartmentsResponse>(
            `${this.apiBaseUrl}/department`,
        );
    }

    getAllCentres():
        Observable<GetCentresResponse> {
        return this.http.get<GetCentresResponse>(
            `${this.apiBaseUrl}/centre`,
        );
    }

}