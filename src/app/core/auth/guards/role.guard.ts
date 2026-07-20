import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
} from '@angular/router';

import { AppRole } from '../models/auth-user.model';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = route => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles =
    route.data?.['roles'] as AppRole[] | undefined;

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (
    !allowedRoles ||
    allowedRoles.length === 0
  ) {
    return true;
  }

  if (authService.hasRole(...allowedRoles)) {
    return true;
  }

  return router.createUrlTree(['/dashboard'], {
    queryParams: {
      accessDenied: 'true',
    },
  });
};