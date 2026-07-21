export interface DepartmentApi {
    id: number;
    departmentName: string;
    description: string | null;
    status: string;
    hod_user: number | null;
    email: string | null;
}

export interface GetDepartmentsResponse {
    success: boolean;
    message: string;
    data: DepartmentApi[];
}