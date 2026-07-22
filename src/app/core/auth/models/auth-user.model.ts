export type AppRole =
  | 'Admin'
  | 'Department Manager'
  | 'Employee';

export interface AuthUser {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  department: string;
  role: AppRole;
  userName?: string;
  employeePhoto?: string | null;
}

export interface DemoAccount extends AuthUser {
  password: string;
}