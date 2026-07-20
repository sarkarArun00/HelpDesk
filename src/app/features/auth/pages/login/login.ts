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
} from '@angular/router';

import { DemoAccount } from '../../../../core/auth/models/auth-user.model';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly authService =
    inject(AuthService);

  private readonly router = inject(Router);

  private readonly activatedRoute =
    inject(ActivatedRoute);

  loginError = '';

  isSubmitting = false;

  showPassword = false;

  readonly demoAccounts =
    this.authService.demoAccounts;

  readonly loginForm =
    this.formBuilder.nonNullable.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
        ],
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
      void this.router.navigate(['/dashboard']);
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
      email,
      password,
      rememberMe,
    } = this.loginForm.getRawValue();

    const loginSuccessful =
      this.authService.login(
        email,
        password,
        rememberMe,
      );

    if (!loginSuccessful) {
      this.isSubmitting = false;

      this.loginError =
        'The email address or password is incorrect.';

      return;
    }

    const requestedReturnUrl =
      this.activatedRoute.snapshot.queryParamMap.get(
        'returnUrl',
      );

    const safeReturnUrl =
      requestedReturnUrl?.startsWith('/')
        ? requestedReturnUrl
        : '/dashboard';

    void this.router.navigateByUrl(
      safeReturnUrl,
    );
  }

  loginWithDemoAccount(
    account: DemoAccount,
  ): void {
    this.loginForm.patchValue({
      email: account.email,
      password: account.password,
      rememberMe: true,
    });

    this.submitLogin();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}