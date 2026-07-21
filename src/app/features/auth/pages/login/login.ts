import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  OnInit,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
  
export class Login implements OnInit {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly authService =
    inject(AuthService);

  private readonly authApiService =
    inject(AuthApiService);

  private readonly router =
    inject(Router);

  private readonly activatedRoute =
    inject(ActivatedRoute);

  loginError = '';

  isSubmitting = false;

  showPassword = false;

  readonly loginForm =
    this.formBuilder.nonNullable.group({
      employeeCode: [
        '',
        [Validators.required],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
        ],
      ],
      rememberMe: [true],
    });

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      void this.router.navigate([
        '/dashboard',
      ]);
    }
  }

  submitLogin(): void {
    this.loginError = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const {
      employeeCode,
      password,
      rememberMe,
    } = this.loginForm.getRawValue();

    this.authApiService
      .login({
        employee_code:
        employeeCode.trim(),
        password,
      })
      .subscribe({
        next: response => {
          if (
            !response.success ||
            !response.access_token
          ) {
            this.isSubmitting = false;

            this.loginError =
              response.message ||
              'Unable to sign in.';

            return;
          }

          this.authService.establishSession(
            response,
            rememberMe,
          );

          const requestedReturnUrl =
            this.activatedRoute.snapshot
              .queryParamMap.get(
                'returnUrl',
              );

          const safeReturnUrl =
            requestedReturnUrl?.startsWith(
              '/',
            ) &&
              !requestedReturnUrl.startsWith(
                '//',
              )
              ? requestedReturnUrl
              : '/dashboard';

          void this.router.navigateByUrl(
            safeReturnUrl,
          );
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.isSubmitting = false;

          this.loginError =
            error.error?.message ||
            'Login failed. Please check your employee code and password.';
        },
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword =
      !this.showPassword;
  }
}