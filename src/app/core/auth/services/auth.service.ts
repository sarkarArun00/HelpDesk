import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

import {
  AppRole,
  AuthUser,
  DemoAccount,
} from '../models/auth-user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);

  private readonly platformId = inject(PLATFORM_ID);

  private readonly localStorageKey =
    'isd-authenticated-user';

  private readonly sessionStorageKey =
    'isd-session-user';

  readonly demoAccounts: readonly DemoAccount[] = [
    {
      id: 1,
      employeeCode: 'EMP-0101',
      fullName: 'Arun Sarkar',
      email: 'admin@nirnayanhealthcare.com',
      password: 'Admin@123',
      department: 'Information Technology',
      role: 'System Admin',
    },
    {
      id: 2,
      employeeCode: 'EMP-0102',
      fullName: 'Rahul Sharma',
      email: 'manager@nirnayanhealthcare.com',
      password: 'Manager@123',
      department: 'Logistics',
      role: 'Department Manager',
    },
    {
      id: 3,
      employeeCode: 'EMP-0106',
      fullName: 'Sourav Dey',
      email: 'employee@nirnayanhealthcare.com',
      password: 'Employee@123',
      department: 'Customer Relationship Management',
      role: 'Employee',
    },
  ];

  private readonly currentUserSignal =
    signal<AuthUser | null>(this.restoreUser());

  readonly currentUser =
    this.currentUserSignal.asReadonly();

  readonly isAuthenticated = computed(
    () => this.currentUserSignal() !== null,
  );

  readonly currentRole = computed(
    () => this.currentUserSignal()?.role ?? null,
  );

  login(
    email: string,
    password: string,
    rememberMe: boolean,
  ): boolean {
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const account = this.demoAccounts.find(
      demoAccount =>
        demoAccount.email.toLowerCase() ===
          normalizedEmail &&
        demoAccount.password === password,
    );

    if (!account) {
      return false;
    }

    const authenticatedUser: AuthUser = {
      id: account.id,
      employeeCode: account.employeeCode,
      fullName: account.fullName,
      email: account.email,
      department: account.department,
      role: account.role,
    };

    this.currentUserSignal.set(authenticatedUser);

    this.saveUser(authenticatedUser, rememberMe);

    return true;
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.clearStoredUser();

    void this.router.navigate(['/login']);
  }

  hasRole(...allowedRoles: AppRole[]): boolean {
    const currentRole =
      this.currentUserSignal()?.role;

    return Boolean(
      currentRole &&
      allowedRoles.includes(currentRole),
    );
  }

  isSystemAdmin(): boolean {
    return this.hasRole('System Admin');
  }

  isDepartmentManager(): boolean {
    return this.hasRole('Department Manager');
  }

  isEmployee(): boolean {
    return this.hasRole('Employee');
  }

  private saveUser(
    user: AuthUser,
    rememberMe: boolean,
  ): void {
    if (!this.isBrowser()) {
      return;
    }

    this.clearStoredUser();

    const serializedUser = JSON.stringify(user);

    if (rememberMe) {
      localStorage.setItem(
        this.localStorageKey,
        serializedUser,
      );

      return;
    }

    sessionStorage.setItem(
      this.sessionStorageKey,
      serializedUser,
    );
  }

  private restoreUser(): AuthUser | null {
    if (!this.isBrowser()) {
      return null;
    }

    try {
      const storedUser =
        localStorage.getItem(
          this.localStorageKey,
        ) ??
        sessionStorage.getItem(
          this.sessionStorageKey,
        );

      if (!storedUser) {
        return null;
      }

      const parsedUser =
        JSON.parse(storedUser) as AuthUser;

      if (
        !parsedUser.id ||
        !parsedUser.email ||
        !parsedUser.fullName ||
        !parsedUser.role
      ) {
        this.clearStoredUser();
        return null;
      }

      return parsedUser;
    } catch {
      this.clearStoredUser();
      return null;
    }
  }

  private clearStoredUser(): void {
    if (!this.isBrowser()) {
      return;
    }

    localStorage.removeItem(
      this.localStorageKey,
    );

    sessionStorage.removeItem(
      this.sessionStorageKey,
    );
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}