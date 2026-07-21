import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Router,
  RouterLink,
} from '@angular/router';

import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly authApiService =
    inject(AuthApiService);
  
  private readonly router =
    inject(Router);

  isSubmitting = false;

  isVerifyingOtp = false;

  otpSent = false;

  otpVerified = false;

  errorMessage = '';

  successMessage = '';

  employeeCode = '';

  resetToken = '';

  isResettingPassword = false;

  showNewPassword = false;

  showConfirmPassword = false;

  readonly forgotPasswordForm =
    this.formBuilder.nonNullable.group({
      employeeCode: [
        '',
        [Validators.required],
      ],
    });

  readonly otpForm =
    this.formBuilder.nonNullable.group({
      otp: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{6}$/),
        ],
      ],
    });
  
  readonly resetPasswordForm =
    this.formBuilder.nonNullable.group({
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
        ],
      ],

      confirmPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
        ],
      ],
    });

  sendOtp(): void {
    this.clearMessages();

    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const { employeeCode } =
      this.forgotPasswordForm.getRawValue();

    this.employeeCode =
      employeeCode.trim();

    this.authApiService
      .forgotPassword({
        employee_code:
          this.employeeCode,
      })
      .subscribe({
        next: response => {
          this.isSubmitting = false;

          if (!response.success) {
            this.errorMessage =
              response.message ||
              'Unable to send OTP.';

            return;
          }

          this.otpSent = true;

          this.successMessage =
            response.message ||
            'OTP sent successfully.';
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.isSubmitting = false;

          this.errorMessage =
            error.error?.message ||
            'Unable to send OTP. Please try again.';
        },
      });
  }

  verifyOtp(): void {
    this.clearMessages();

    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isVerifyingOtp = true;

    const { otp } =
      this.otpForm.getRawValue();

    this.authApiService
      .verifyOtp({
        employee_code:
          this.employeeCode,
        otp: Number(otp),
      })
      .subscribe({
        next: response => {
          this.isVerifyingOtp = false;

          if (!response.success) {
            this.errorMessage =
              response.message ||
              'Invalid OTP.';

            return;
          }

          const resetToken =
            response.reset_token ??
            response.token ??
            '';

          if (!resetToken) {
            this.errorMessage =
              'OTP was verified, but the reset token was not received.';

            return;
          }

          this.resetToken = resetToken;
          this.otpVerified = true;

          this.successMessage =
            response.message ||
            'OTP verified successfully. Create your new password.';
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.isVerifyingOtp = false;

          this.errorMessage =
            error.error?.message ||
            'OTP verification failed.';
        },
      });
  }

  resendOtp(): void {
    this.otpForm.reset();
    this.sendOtp();
  }

  changeEmployeeCode(): void {
    this.otpSent = false;
    this.otpVerified = false;
    this.employeeCode = '';
    this.resetToken = '';
    this.resetPasswordForm.reset();
    this.otpForm.reset();
    this.clearMessages();
  }

  resetPassword(): void {
    this.clearMessages();

    if (
      this.resetPasswordForm.invalid
    ) {
      this.resetPasswordForm
        .markAllAsTouched();

      return;
    }

    const {
      newPassword,
      confirmPassword,
    } =
      this.resetPasswordForm.getRawValue();

    if (
      newPassword !== confirmPassword
    ) {
      this.errorMessage =
        'New password and confirm password do not match.';

      return;
    }

    if (!this.resetToken) {
      this.errorMessage =
        'Your password reset session has expired. Please request a new OTP.';

      return;
    }

    this.isResettingPassword = true;

    this.authApiService
      .resetPassword({
        reset_token: this.resetToken,
        new_password: newPassword,
      })
      .subscribe({
        next: response => {
          this.isResettingPassword = false;

          if (!response.success) {
            this.errorMessage =
              response.message ||
              'Unable to reset password.';

            return;
          }

          void this.router.navigate(
            ['/login'],
            {
              queryParams: {
                passwordReset: 'success',
              },
            },
          );
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.isResettingPassword = false;

          this.errorMessage =
            error.error?.message ||
            'Unable to reset password. Please try again.';
        },
      });
  }

  toggleNewPassword(): void {
    this.showNewPassword =
      !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword =
      !this.showConfirmPassword;
  }
  
  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}